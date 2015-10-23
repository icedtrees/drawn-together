'use strict';

var ChatSettings = require('../../shared/config/game.shared.chat.config.js');
var GameLogic = require('../../shared/helpers/game.shared.gamelogic.js');
var GameSettings = require('../../shared/config/game.shared.game.config.js');
var TopicList = require('../../shared/helpers/game.shared.topiclist.js');
var TopicSettings = require('../../shared/config/game.shared.topic.config.js');
var Utils = require('../../shared/helpers/game.shared.utils.js');
var ServerUtils = require('../helpers/game.server.utils.js');

// cln_fuzzy library (for calculating distance between words)
var clj_fuzzy = require('clj-fuzzy');
var jaro_winkler = clj_fuzzy.metrics.jaro_winkler;
var porter = clj_fuzzy.stemmers.porter;
var levenshtein = clj_fuzzy.metrics.levenshtein;

// Server timer
var timer;
var timerInterval;
var timerSet = false; // only set server timer once

var topicLists = new TopicList.TopicLists();
topicLists.loadTopicLists();
TopicSettings.topicListName.options = topicLists.getAllTopicListNames();

// Game object encapsulating game logic
var Game = new GameLogic.Game({
  numRounds: GameSettings.numRounds.default,
  numDrawers: 1,
  roundTime: GameSettings.roundTime.default,
  timeAfterGuess: GameSettings.timeAfterGuess.default,
  topicListName: TopicSettings.topicListName.default,
  topicListDifficulty: TopicSettings.topicListDifficulty.default,
  topicListWords: topicLists.getTopicListWordNames('default', 'all')
}); // parameters: numRounds, numDrawers, timeToEnd, topicListName,

// Dictionary counting number of connects made by each user
var userConnects = {};

/* Array of draw actions
 * drawHistory = [
 *   {
 *     type: 'line'
 *     x1: last x pos
 *     y1: last y pos
 *     x2: cur x pos
 *     y2: cur y pos
 *     strokeStyle: colour code
 *   },
 *   {
 *     type: 'rect'
 *     x: last x pos
 *     y: last y pos
 *     width: cur x pos
 *     height: cur y pos
 *     fill: colour code
 *     strokeStyle: colour code
 *   },
 *   {
 *     type: 'clear'
 *   }
 * ]
 */
var drawHistory = [];

// Every chat message sent
var gameMessages = [];

function checkGuess(guess, topic) {
  // STAGE 1 - basic JW distance
  var score = jaro_winkler(guess, topic);
  var t = Math.max(0.90, 0.96 - guess.length / 130); // starts at 0.96 and moves towards 0.9 for longer guesses
  if (score < 0.8 || score > t) {
    return {score: score, close: score > t, stage: 1};
  }

  // STAGE 2 - JW distance on the word root
  var guessRoot = porter(guess);
  var topicRoot = porter(topic);
  score = jaro_winkler(guessRoot, topicRoot);
  score -= levenshtein(guessRoot, topicRoot) / 60;
  if (score < 0.8 || score > t) {
    return {score: score, close: score > t, stage: 2};
  }

  // STAGE 3 - check levenshtein distance of entire words
  var lev = levenshtein(guess, topic);
  return {score: score, close: lev <= (guess.length - 5) / 3.5 + 1, stage: 3};
}

/*
 * returns a list of matching words from the guess and topic
 * punctuation is ignored when finding matches
 * common grammatical words like "the" and "a" are ignored
 */
function matchingWords(guess, topic) {
  // uses the original guess and topic to preserve punctuation so we can split on spaces/dash
  // keep punctuation for topic words, so we can tell the guesser the prompt contains "fire's" rather than "fires"
  var guessWords = ServerUtils.importantWords(guess, true); // true => remove punctuation from guess words
  var topicWords = ServerUtils.importantWords(topic, false); // false => keep punctuation

  if (!guessWords || !topicWords) {
    return [];
  }

  var matches = [];
  for (var i = 0; i < guessWords.length; i++) {
    for (var j = 0; j < topicWords.length; j++) {
      if (guessWords[i] === topicWords[j].replace(/[\W_]/g, '')) {
        matches.push(topicWords[j]); // topicWords[j] has correct punctuation, guessWords[i] has no punctuation
      }
    }
  }
  return matches;
}

// Create the game configuration
module.exports = function (io, socket) {
  if (!timerSet) {
    timer = new Utils.Timer();
    timerSet = true;
    timerInterval = setInterval(tick, 1000); // call tick every second
  }

  function broadcastMessage(message) {
    message.created = Date.now();
    gameMessages.push(message);
    if (gameMessages.length > ChatSettings.MAX_MESSAGES) {
      gameMessages.shift();
    }
    io.emit('gameMessage', message);
  }

  topicLists.shuffleWords(Game.topicListWords);

  function sendTopic() {
    // Select a new topic and send it to the new drawer
    Game.topicListWords.push(Game.topicListWords.shift());
    Game.getDrawers().forEach(function (drawer) {
      io.to(drawer).emit('topic', Game.topicListWords[0]);
    });

    // Announce the new drawers
    var newDrawersAre = Utils.toCommaListIs(Utils.boldList(Game.getDrawers()));
    broadcastMessage({
      class: 'status',
      text: newDrawersAre + ' now drawing'
    });
  }

  function advanceRound() {
    timer.paused = true;
    var gameFinished = Game.advanceRound();

    // Send user list with updated drawers
    io.emit('advanceRound');

    io.emit('canvasMessage', {type: 'clear'});
    drawHistory = [];

    // Explain what the word was
    broadcastMessage({
      class: 'status',
      text: 'The prompt was "' + Game.topicListWords[0] + '"'
    });

    if (gameFinished) {
      var winners = Game.getWinners();
      broadcastMessage({
        class: 'status',
        text: Utils.toCommaList(Utils.boldList(winners)) + ' won the game on ' +
              Game.users[winners[0]].score + ' points! A new game will start ' +
              'in ' + GameSettings.TIME_BETWEEN_GAMES + ' seconds'
      });
      io.emit('gameFinished');
      setTimeout(function () {
        drawHistory = [];
        Game.resetGame();
        io.emit('resetGame');
      }, GameSettings.TIME_BETWEEN_GAMES * 1000);
    } else {
      startRound();
    }
  }

  function startRound() {
    sendTopic();
    broadcastMessage({
      class: 'status',
      text: Game.roundTime + " seconds to draw."
    });

    // start round timer
    setTimer(Game.roundTime);
    timer.paused = false;
  }

  function giveUp() {
    if (!Game.started) {
      return;
    }

    broadcastMessage({
      class: 'status',
      text: '<b>' + username + '</b>' + ' has given up'
    });
    advanceRound();
  }

  function timesUp() {
    broadcastMessage({
      class: 'status',
      text: Game.correctGuesses === 0 ? "Time's up! No one guessed " + username + "'s drawing" : 'Round over!'
    });

    advanceRound();
  }

  function tick() {
    if (timer.paused) {
      return;
    }

    var timeLeft = Utils.Timer.tick(timer);
    io.emit('updateTime', timeLeft);

    if (timeLeft === 20) {
      broadcastMessage({
        class: 'status',
        text: '20 seconds left.'
      });
    }

    if (timeLeft === 10) {
      broadcastMessage({
        class: 'status',
        text: '10 seconds left.'
      });
    }

    if (timeLeft <= 0)  {
      timesUp();
    }
  }

  function setTimer(time) {
    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
    timer.timeLeft = time;
    io.emit('updateTime', time);
  }

  var username = socket.request.user.username;
  var profileImageURL = socket.request.user.profileImageURL;
  socket.join(username);

  // Add user to in-memory store if necessary, or simply increment counter
  // to account for multiple windows open
  if (username in userConnects) {
    userConnects[username]++;
  } else {
    userConnects[username] = 1;
    Game.addUser(username, profileImageURL);

    // Emit the status event when a new socket client is connected
    broadcastMessage({
      class: 'status',
      text: '<b>' + username + '</b>' + ' is now connected'
    });

    // Notify everyone about the new joined user (not the sender though)
    socket.broadcast.emit('userConnect', {
      username: username,
      image: profileImageURL
    });
  }

  // Start the game
  socket.on('startGame', function () {
    if (!Game.started && username === Game.getHost()) {
      Game.startGame();
      io.emit('startGame');
      startRound();
    }
  });

  // Change a game setting as the host
  socket.on('changeSetting', function (change) {
    if (!Game.started && username === Game.getHost()) {
      // make sure change uses one of the options given
      if ((GameSettings[change.setting] && GameSettings[change.setting].options.indexOf(change.option) === -1) ||
          (TopicSettings[change.setting] && TopicSettings[change.setting].options.indexOf(change.option) === -1)) {
        return;
      }

      // apply settings selected by host
      Game[change.setting] = change.option;

      // Get the topic list for the new topic list settings
      Game.topicListWords = topicLists.getTopicListWordNames(Game.topicListName, Game.topicListDifficulty);
      topicLists.shuffleWords(Game.topicListWords);

      // tell all clients about the new setting
      io.emit('updateSetting', change);
    }
  });

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function () {
    // Send current game state
    socket.emit('gameState', Game);

    // Send the chat message history to the user
    socket.emit('gameMessage', gameMessages);

    // Send the draw history to the user
    socket.emit('canvasMessage', drawHistory);

    // Send time left to the user
    socket.emit('updateTime', timer.timeLeft);

    // Send current topic if they are the drawer
    if (Game.isDrawer(username)) {
      socket.emit('topic', Game.topicListWords[0]);
    }

  });

  // Handle chat messages
  socket.on('gameMessage', function (message) {
    // Don't trust user data - create a new object from expected user fields
    message = {
      class: 'user-message',
      text: message.text.toString(),
      username: username
    };

    // Disallow messages that are empty or longer than MAX_MSG_LEN characters
    if (message.text.length > ChatSettings.MAX_MSG_LEN || /^\s*$/.test(message.text)) {
      return;
    }

    // If game hasn't started, or ended, don't check any guesses
    if (!Game.started || Game.currentRound >= Game.numRounds) {
      broadcastMessage(message);
      return;
    }

    // The current drawer cannot chat
    if (Game.isDrawer(username)) {
      return;
    }

    // Compare the lower-cased versions
    var guess = message.text.toLowerCase();
    var topic = Game.topicListWords[0].toLowerCase();
    var filteredGuess = guess.replace(/[\W_]/g, ''); // only keep letters and numbers
    var filteredTopic = topic.replace(/[\W_]/g, '');
    if (filteredGuess === filteredTopic) {
      // Correct guess
      message.created = Date.now();
      message.class = 'correct-guess';

      // Send user's guess to the drawer/s
      message.addon = 'This guess is correct!';
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // Send the user's guess to themselves
      message.addon = 'Your guess is correct!';
      socket.emit('gameMessage', message);

      // Don't update game state if user has already guessed the prompt
      if (Game.userHasGuessed(username)) {
        return;
      }

      // Mark user as correct and increase their score
      Game.markCorrectGuess(username);
      io.emit('markCorrectGuess', username); // tell clients to update the score too

      // Alert everyone in the room that the guesser was correct
      broadcastMessage({
        class: 'status',
        text: '<b>' + username + '</b>' + ' has guessed the prompt!'
      });

      // End round if everyone has guessed
      if (Game.allGuessed()) {
        broadcastMessage({
          class: 'status',
          text: 'Round over! Everyone has guessed correctly!'
        });
        advanceRound();
      } else if (Game.correctGuesses === 1) {
        // Start timer to end round if this is the first correct guess
        broadcastMessage({
          class: 'status',
          text: "The round will end in " + Game.timeAfterGuess + " seconds."
        });
        setTimer(Game.timeAfterGuess);
      }

    } else {
      var guessResult = checkGuess(filteredGuess, filteredTopic);
      var matches = matchingWords(guess, topic);

      if (!guessResult.close && matches.length === 0) {
        // Incorrect guess: emit message to everyone
        broadcastMessage(message);
      } else {
        message.created = Date.now();
        message.class = 'close-guess';
        message.addon = guessResult.close ? 'This guess is close! ' : '';

        if (guessResult.close) {
          message.debug = guess + " has score " + guessResult.score.toFixed(2) + ". At stage " + guessResult.stage;
        }

        if (matches.length > 0) {
          message.addon += 'The prompt contains: ' + Utils.toCommaList(matches);
        }

        // Send message to drawers
        Game.getDrawers().forEach(function (drawer) {
          io.to(drawer).emit('gameMessage', message);
        });

        // Send message to guesser
        if (guessResult.close) {
          message.addon = message.addon.replace('This', 'Your');
        }

        socket.emit('gameMessage', message);
      }
    }
  });

  // Send a canvas drawing command to all connected sockets when a message is received
  socket.on('canvasMessage', function (message) {
    if (!Game.started) {
      return;
    }

    if (Game.isDrawer(username)) {
      if (message.type === 'clear') {
        drawHistory = [];
      } else {
        drawHistory.push(message);
      }

      // Emit the 'canvasMessage' event
      socket.broadcast.emit('canvasMessage', message);
    }
  });

  // Current drawer has finished drawing
  socket.on('finishDrawing', function () {
    if (!Game.started) {
      return;
    }

    // If the user who submitted this message actually is a drawer
    // And prevent round ending prematurely when prompt has been guessed
    if (Game.isDrawer(username) && Game.correctGuesses === 0) {
      giveUp();
    }
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', function () {
    userConnects[username]--;
    if (userConnects[username] === 0) {
      // Emit the status event when a socket client is disconnected
      broadcastMessage({
        class: 'status',
        text: '<b>' + username + '</b>' + ' is now disconnected',
      });

      // If the disconnecting user is a drawer, this is equivalent to
      // 'giving up' or passing
      if (Game.started && Game.isDrawer(username)) {
        giveUp();
      }
      delete userConnects[username];
      Game.removeUser(username);

      // Notify all users that this user has disconnected
      io.emit('userDisconnect', username);
    }
  });
};
