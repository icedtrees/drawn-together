'use strict';

var ChatSettings = require('../../shared/config/game.shared.chat.config.js');
var GameLogic = require('../../shared/helpers/game.shared.gamelogic.js');
var Utils = require('../../shared/helpers/game.shared.utils.js');
var ServerUtils = require('../helpers/game.server.utils.js');

// cln_fuzzy library (for calculating distance between words)
var clj_fuzzy = require('clj-fuzzy');
var jaro_winkler = clj_fuzzy.metrics.jaro_winkler;
var porter = clj_fuzzy.stemmers.porter;
var levenshtein = clj_fuzzy.metrics.levenshtein;

// A timeout created to end the round seconds when someone guesses the prompt
var roundTimeout;
// Game object encapsulating game logic
var Game =  new GameLogic.Game({
  numRounds: 5,
  numDrawers: 1,
  roundTime: 90,
  timeToEnd: 20
}); // parameters: numRounds, numDrawers, timeToEnd

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

// First one is the current topic
var topicList = ['half', 'cardboard', 'oar', 'baby-sitter', 'drip', 'shampoo', 'point', 'time machine', 'yardstick', 'think', 'lace', 'darts', 'world', 'avocado', 'bleach', 'shower curtain', 'extension cord', 'dent', 'birthday', 'lap',   'sandbox', 'bruise', 'quicksand', 'fog', 'gasoline', 'pocket', 'honk', 'sponge', 'rim', 'bride', 'wig', 'zipper', 'wag',   'letter opener', 'fiddle', 'water buffalo', 'pilot', 'brand', 'pail', 'baguette', 'rib', 'mascot', 'fireman pole', 'zoo',   'sushi', 'fizz', 'ceiling fan', 'bald', 'banister', 'punk', 'post office', 'season', 'Internet', 'chess', 'puppet', 'chime',   'ivy', 'full', 'koala', 'dentist', 'baseboards', 'ping pong', 'bonnet', 'mast', 'hut', 'welder', 'dryer sheets', 'sunburn',   'houseboat', 'sleep', 'kneel', 'crust', 'grandpa', 'speakers', 'cheerleader', 'dust bunny', 'salmon', 'cabin', 'handle',   'swamp', 'cruise', 'wedding cake', 'crow\'s nest', 'macho', 'drain', 'foil', 'orbit', 'dream', 'recycle', 'raft', 'gold', 'plank', 'cliff', 'sweater vest', 'cape', 'safe', 'picnic', 'shrink ray', 'leak', 'boa constrictor', 'deep', 'mold', 'CD', 'tiptoe', 'hurdle', 'knight', 'loveseat', 'cloak', 'bedbug', 'bobsled', 'hot tub', 'firefighter', 'cell phone charger', 'beanstalk', 'nightmare', 'coach', 'moth', 'sneeze', 'wooly mammoth', 'pigpen', 'swarm', 'goblin', 'chef', 'applause', 'wax', 'sheep dog', 's\'mores', 'plow', 'runt'];
// Shuffle the topic list in-place using Knuth shuffle
for (var i = topicList.length - 2; i > 0; i--) {
  var j = Math.floor(Math.random() * i);
  var temp = topicList[j];
  topicList[j] = topicList[i];
  topicList[i] = temp;
}

function checkGuess(guess, topic) {
  // STAGE 1 - basic JW distance
  var score = jaro_winkler(guess, topic);
  var t = Math.max(0.90, 0.96 - guess.length / 130); // starts at 0.96 and moves towards 0.9 for longer guesses
  if (score < 0.8 || score > t) {
    return {score : score, close : score > t ? true : false, stage : 1};
  }

  // STAGE 2 - JW distance on the word root
  var guessRoot = porter(guess);
  var topicRoot = porter(topic);
  score = jaro_winkler(guessRoot, topicRoot);
  score -= levenshtein(guessRoot, topicRoot) / 60;
  if (score < 0.8 || score > t) {
    return {score : score, close : score > t ? true : false, stage : 2};
  }

  // STAGE 3 - check levenshtein distance of entire words
  var lev = levenshtein(guess, topic);
  return {score : score, close : lev <= (guess.length - 5)/3.5 + 1, stage : 3};
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
  function broadcastMessage(message) {
    gameMessages.push(message);
    if (gameMessages.length > ChatSettings.MAX_MESSAGES) {
      gameMessages.shift();
    }
    io.emit('gameMessage', message);
  }
  function sendTopic() {
    // Select a new topic and send it to the new drawer
    topicList.push(topicList.shift());
    Game.getDrawers().forEach(function (drawer) {
      io.to(drawer).emit('topic', topicList[0]);
    });

    // Announce the new drawers
    var drawers = Game.getDrawers();
    var newDrawersAre = Utils.toCommaListIs(drawers);
    broadcastMessage({
      class: 'status',
      text: newDrawersAre + ' now drawing.'
    });
  }

  function advanceRound() {
    var gameFinished = Game.advanceRound();

    // Send user list with updated drawers
    io.emit('advanceRound');

    io.emit('canvasMessage', {type: 'clear'});
    drawHistory = [];

    // Explain what the word was
    broadcastMessage({
      class: 'status',
      text: 'Round over! The topic was "' + topicList[0] + '"'
    });

    if (gameFinished) {
      var winners = Game.getWinners();
      broadcastMessage({
        class: 'status',
        text: 'The winner(s) of the game: ' + Utils.toCommaList(winners) + ' on ' +
              Game.users[winners[0]].score + ' points! A new game will start ' +
              'in ' + Game.timeToEnd + ' seconds.'
      });
      setTimeout(function () {
        gameMessages = [];
        drawHistory = [];
        Game.resetGame();
        io.emit('resetGame');
        sendTopic();
      }, Game.timeToEnd * 1000);
    } else {
      sendTopic();
    }
  }

  function giveUp() {
    broadcastMessage({
      type: 'status',
      text: username + ' has given up'
    });
    advanceRound();
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
    var message = {
      class: 'status',
      text: username + ' is now connected',
      created: Date.now(),
    };
    broadcastMessage(message);

    // Notify everyone about the new joined user (not the sender though)
    socket.broadcast.emit('userConnect', {
      username: username,
      image: profileImageURL
    });
  }

  // Start the game
  socket.on('startGameButton', function (settings) {
    if (username === Game.getHost()) {
      // apply settings selected by host
      Game.numRounds = settings.numRounds;
      Game.roundTime = settings.roundTime;
      Game.timeToEnd = settings.timeToEnd;
      Game.startGame();

      // tell all clients that the game has started
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('topic', topicList[0]);
      });
      io.emit('startGame', settings);
    }
  });

  // Start the game
  socket.on('changeSetting', function (change) {
    if (username === Game.getHost()) {
      // apply settings selected by host
      Game[change.setting] = change.option;

      // tell all clients about the new setting
      io.emit('updateSetting', change);
    }
  });

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function () {
    // Send current game state
    socket.emit('gameState', Game);

    if (!Game.started) {
      return;
    }

    // Send the chat message history to the user
    socket.emit('gameMessage', gameMessages);

    // Send the draw history to the user
    socket.emit('canvasMessage', drawHistory);

    // Send current topic if they are the drawer
    if (Game.isDrawer(username)) {
      socket.emit('topic', topicList[0]);
    }

  });
  
  // Handle chat messages
  socket.on('gameMessage', function (message) {
    // Disallow messages that are empty or longer than MAX_MSG_LEN characters
    if (message.text.length > ChatSettings.MAX_MSG_LEN || /^\s*$/.test(message.text)) {
      return;
    }

    message.created = Date.now();
    message.username = username;

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
    var topic = topicList[0].toLowerCase();
    var filteredGuess = guess.replace(/[\W_]/g, ''); // only keep letters and numbers
    var filteredTopic = topic.replace(/[\W_]/g, '');
    if (filteredGuess === filteredTopic) {
      // Correct guess

      // Send user's guess to the drawer/s
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // Send the user's guess to themselves
      message.addon = 'Your guess is correct!';
      message.class = 'correct-guess';
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
        username: username,
        text: 'has guessed the prompt!'
      });

      // End round if everyone has guessed
      if (Game.allGuessed()) {
        clearTimeout(roundTimeout);
        advanceRound();
      } else if (Game.correctGuesses === 1) {
        // Start timer to end round if this is the first correct guess
        broadcastMessage({
          class: 'status',
          text: "The round will end in " + Game.timeToEnd + " seconds."
        });
        roundTimeout = setTimeout(function () {
          advanceRound();
        }, Game.timeToEnd * 1000);
      }

    } else {
      var guessResult = checkGuess(filteredGuess, filteredTopic);
      var matches = matchingWords(guess, topic);

      if (!guessResult.close && matches.length === 0) {
        // Incorrect guess: emit message to everyone
        broadcastMessage(message);
      } else {
        message.class = 'close-guess';
        message.addon = guessResult.close ? 'This guess is close! ' : '';

        if (guessResult.close) {
          message.debug = guess + " has score " + guessResult.score.toFixed(2) + ". At stage " + guessResult.stage;
        }

        if (matches.length > 0) {
          message.addon += 'The prompt contains: ' + Utils.toCommaList(matches);
        }

        // send message to drawers
        Game.getDrawers().forEach(function (drawer) {
          io.to(drawer).emit('gameMessage', message);
        });

        // send message to guesser
        if (guessResult.close) {
          message.addon = message.addon.replace('This', 'Your');
        }
        socket.emit('gameMessage', message);
      }
    }
  });

  // Send a canvas drawing command to all connected sockets when a message is received
  socket.on('canvasMessage', function (message) {
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
        text: username + ' is now disconnected',
        created: Date.now(),
      });

      // If the disconnecting user is a drawer, this is equivalent to
      // 'giving up' or passing
      if (Game.isDrawer(username)) {
        giveUp();
      }
      delete userConnects[username];
      Game.removeUser(username);

      // Notify all users that this user has disconnected
      io.emit('userDisconnect', username);
    }
  });
};
