'use strict';

var ChatSettings = require('../../shared/config/game.shared.chat.config.js');
var GameLogic = require('../../shared/helpers/game.shared.gamelogic.js');
var GameSettings = require('../../shared/config/game.shared.game.config.js');
var TopicSettings = require('../../shared/config/game.shared.topic.config.js');
var Utils = require('../../shared/helpers/game.shared.utils.js');
var ServerUtils = require('../helpers/game.server.utils.js');
var TopicList = require('../helpers/game.server.topiclist.js');

// cln_fuzzy library (for calculating distance between words)
var clj_fuzzy = require('clj-fuzzy');
var jaro_winkler = clj_fuzzy.metrics.jaro_winkler;
var porter = clj_fuzzy.stemmers.porter;
var levenshtein = clj_fuzzy.metrics.levenshtein;

// Map of room names to game objects
var games = {};

var prompts = [];

// Socket id to room name
var socketToRoom = {};

// List of all rooms
var rooms = [];

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
  function getGame() {
    return games[socketToRoom[socket.id]];
  }

  function broadcastMessage(message, room) {
    room = room || socketToRoom[socket.id];
    message.created = Date.now();
    getGame().messageHistory.push(message);
    if (getGame().messageHistory.length > ChatSettings.MAX_MESSAGES) {
      getGame().messageHistory.shift();
    }
    io.to(room).emit('gameMessage', message);
  }

  function sendTopic(GameObj, room) {
    GameObj = GameObj || getGame();
    var Game = GameObj.Game;
    room = room || socketToRoom[socket.id];

    // Select a new topic and send it to the new drawer
    prompts.push(prompts.shift());
    Game.getDrawers().forEach(function (drawer) {
      io.to(room+'/'+drawer).emit('topic', prompts[0]);
    });

    // Announce the new drawers
    var newDrawersAre = Utils.toCommaListIs(Utils.boldList(Game.getDrawers()));
    broadcastMessage({
      class: 'status',
      text: newDrawersAre + ' now drawing'
    }, room);
  }

  function advanceRound(GameObj, room) {
    GameObj = GameObj || getGame();
    var Game = GameObj.Game;
    room = room || socketToRoom[socket.id];
    var gameFinished = Game.advanceRound();

    // Send user list with updated drawers
    io.to(room).emit('advanceRound');

    io.to(room).emit('canvasMessage', {type: 'clear'});
    GameObj.drawHistory = [];

    // Explain what the word was
    broadcastMessage({
      class: 'status',
      text: 'The prompt was "' + prompts[0] + '"'
    }, room);

    if (gameFinished) {
      var winners = Game.getWinners();
      broadcastMessage({
        class: 'status',
        text: Utils.toCommaList(Utils.boldList(winners)) + ' won the game on ' +
              Game.users[winners[0]].score + ' points! A new game will start ' +
              'in ' + GameSettings.TIME_BETWEEN_GAMES + ' seconds'
      }, room);
      io.to(room).emit('gameFinished');

      // Draw winners on canvas
      var message = {
        type: 'text',
        text: 'The ' + (winners.length === 1 ? 'winner is' : 'winners are') + ':',
        align: 'center',
        colour: 'black',
        x: 300,
        y: 50
      };
      GameObj.drawHistory.push(message);
      io.to(room).emit('canvasMessage', message);

      message.y += 50;
      for (var i = 0; i < winners.length; i++) {
        message.text = winners[i];
        GameObj.drawHistory.push(message);
        io.to(room).emit('canvasMessage', message);
        message.y += 50;
      }

      message.align = 'center';
      message.y = 500;
      message.text = 'Please respect the other contestants';
      GameObj.drawHistory.push(message);
      io.to(room).emit('canvasMessage', message);
      message.y += 35;
      message.text = 'and do not deface this message';
      GameObj.drawHistory.push(message);
      io.to(room).emit('canvasMessage', message);

      setTimeout(function () {
        GameObj.timerTop.pause();
        GameObj.timerBot.pause();
        GameObj.timerRemind.pause();
        GameObj.drawHistory = [];
        Game.resetGame();
        io.to(room).emit('resetGame');
      }, GameSettings.TIME_BETWEEN_GAMES * 1000);
    } else {
      startRound(GameObj, room);
    }
  }

  function startRound(GameObj, room) {
    GameObj = GameObj || getGame();
    var Game = GameObj.Game;
    room = room || socketToRoom[socket.id];

    sendTopic(GameObj, room);
    broadcastMessage({
      class: 'status',
      text: getGame().Game.roundTime + " seconds to draw."
    }, room);

    GameObj.timerTop.restart(timesUp.bind(null, GameObj, room), Game.roundTime * 1000);
    GameObj.timerRemind.restart(function () {
      broadcastMessage({
        class: 'status',
        text: '10 seconds left!'
      }, room);
    }, (Game.roundTime - 10) * 1000);
    GameObj.timerBot.delay = Game.timeAfterGuess * 1000;
  }

  function giveUp() {
    if (!getGame().Game.started) {
      return;
    }

    broadcastMessage({
      class: 'status',
      text: '<b>' + username + '</b>' + ' has given up'
    });
    advanceRound();
  }

  function timesUp(GameObj, room) {
    GameObj = GameObj || getGame();
    var Game = GameObj.Game;
    room = room || socketToRoom[socket.id];

    broadcastMessage({
      class: 'status',
      text: Game.correctGuesses === 0 ? "Time's up! No one guessed " + Game.getDrawers()[0] + "'s drawing" : 'Round over!'
    }, room);

    advanceRound(GameObj, room);
  }

  var username = socket.request.user.username;
  var profileImageURL = socket.request.user.profileImageURL;

  // Join a room
  function joinRoom (roomName) {
    if (socketToRoom[socket.id] === roomName) {
      return;
    }

    // Join the room as well as the room specific username grouping
    socket.join(roomName);
    socket.join(roomName+'/'+username);
    socketToRoom[socket.id] = roomName;

    // Create the room and the game if it doesn't exist
    if (!games[roomName]) {
      games[roomName] = {};
      games[roomName].Game = new GameLogic.Game({
        numRounds: GameSettings.numRounds.default,
        numDrawers: 1,
        roundTime: GameSettings.roundTime.default,
        timeAfterGuess: GameSettings.timeAfterGuess.default,
        topicListName: TopicSettings.topicListName.default,
        topicListDifficulty: TopicSettings.topicListDifficulty.default
      });
      games[roomName].drawHistory = [];
      games[roomName].messageHistory = [];

      // Server timer
      games[roomName].timerTop = new Utils.Timer();
      games[roomName].timerBot = new Utils.Timer();
      games[roomName].timerRemind = new Utils.Timer();

      // Add to room list
      var room = {
        name: roomName,
        host: username,
        topic: games[roomName].Game.topicListName + ' (' + games[roomName].Game.topicListDifficulty + ')',
        numPlayers: 0,
        maxNumPlayers: GameSettings.MAX_NUM_PLAYERS
      };
      rooms.push(room);
      io.emit('changeRoom', room);
    }

    // Add user to in-memory store if necessary, or simply increment counter
    // to account for multiple windows open
    if (username in getGame().Game.users) {
      getGame().Game.users[username].connects++;
    } else {
      getGame().Game.addUser(username, profileImageURL);
      getGame().Game.users[username].connects = 1;

      // Increase number of players in room
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name === roomName) {
          rooms[i].numPlayers++;
          io.emit('changeRoom', rooms[i]);
          break;
        }
      }

      // Emit the status event when a new socket client is connected
      var message = {
        created: Date.now(),
        class: 'status',
        text: '<b>'+username+'</b>' + ' is now connected'
      };
      getGame().messageHistory.push(message);
      if (getGame().messageHistory.length > ChatSettings.MAX_MESSAGES) {
        getGame().messageHistory.shift();
      }
      socket.broadcast.to(roomName).emit('gameMessage', message);

      // Notify everyone about the new joined user (not the sender though)
      socket.broadcast.to(roomName).emit('userConnect', {
        username: username,
        image: profileImageURL
      });
    }
  }

  function leaveRoom () {
    var roomName = socketToRoom[socket.id];
    if (!roomName) {
      return;
    }
    if (!getGame()) {
      return;
    }

    getGame().Game.users[username].connects--;
    if (getGame().Game.users[username].connects === 0) {
      // Emit the status event when a socket client is disconnected
      broadcastMessage({
        class: 'status',
        text: '<b>'+username+'</b>' + ' is now disconnected',
      });

      // Decrease number of players in room
      var roomIndex;
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name === roomName) {
          rooms[i].numPlayers--;
          roomIndex = i;
          break;
        }
      }

      // If the disconnecting user is a drawer, this is equivalent to
      // 'giving up' or passing
      if (getGame().Game.started && getGame().Game.isDrawer(username)) {
        giveUp();
      }
      var oldHost = getGame().Game.getHost();
      getGame().Game.removeUser(username);
      var newHost = getGame().Game.getHost();
      if (newHost !== oldHost) {
        rooms[roomIndex].host = newHost;
      }
      io.emit('changeRoom', rooms[roomIndex]);

      // Notify all users that this user has disconnected
      io.to(socketToRoom[socket.id]).emit('userDisconnect', username);

      // If there are no users left, destroy this game instance
      if (getGame().Game.userList.length === 0) {
        getGame().timerTop.pause();
        getGame().timerBot.pause();
        getGame().timerRemind.pause();

        delete games[roomName];
        rooms.splice(roomIndex, 1);
      }
    }

    socket.leave(roomName);
    socket.leave(roomName+'/'+username);
    delete socketToRoom[socket.id];
  }
  socket.on('leaveRoom', leaveRoom);

  socket.on('requestRooms', function () {
    socket.emit('requestRooms', rooms);
  });

  socket.on('checkRoomName', function (roomName) {
    if (roomName === '' || games[roomName]) {
      socket.emit('invalidRoomName', roomName);
    } else {
      socket.emit('validRoomName', roomName);
    }
  });

  // Start the game
  socket.on('startGame', function () {
    if (!getGame().Game.started && username === getGame().Game.getHost()) {
      prompts = TopicList.getTopicWords(getGame().Game.topicListName, getGame().Game.topicListDifficulty);
      ServerUtils.shuffleWords(prompts);
      getGame().Game.startGame();
      io.to(socketToRoom[socket.id]).emit('startGame');
      startRound();
    }
  });

  // Change a game setting as the host
  socket.on('changeSetting', function (change) {
    if (!getGame().Game.started && username === getGame().Game.getHost()) {
      // make sure change uses one of the options given
      if ((GameSettings[change.setting] && GameSettings[change.setting].options.indexOf(change.option) === -1) ||
          (TopicSettings[change.setting] && TopicSettings[change.setting].options.indexOf(change.option) === -1)) {
        return;
      }

      // apply settings selected by host
      getGame().Game[change.setting] = change.option;

      // If its a topic change, update room list
      if (change.setting === 'topicListName' || change.setting === 'topicListDifficulty') {
        for (var i = 0; i < rooms.length; i++) {
          if (rooms[i].name === socketToRoom[socket.id]) {
            rooms[i].topic = getGame().Game.topicListName + ' (' + getGame().Game.topicListDifficulty + ')';
            io.emit('changeRoom', rooms[i]);
            break;
          }
        }
      }

      // tell all clients about the new setting
      io.to(socketToRoom[socket.id]).emit('updateSetting', change);
    }
  });

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function (roomName) {
    if (socketToRoom[socket.id] !== roomName) {
      joinRoom(roomName);
    }
    // Send current game state
    socket.emit('gameState', getGame().Game);

    // Send the chat message history to the user
    socket.emit('gameMessage', getGame().messageHistory);

    // Send the draw history to the user
    socket.emit('canvasMessage', getGame().drawHistory);

    // Send time left to the user
    socket.emit('updateTime', {timerTop: {delay: getGame().timerTop.timeLeft(), paused: getGame().timerTop.paused}, timerBot: {delay: getGame().timerBot.timeLeft(), paused: getGame().timerBot.paused}});

    // Send current topic if they are the drawer
    if (getGame().Game.isDrawer(username)) {
      socket.emit('topic', prompts[0]);
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
    if (!getGame().Game.started || getGame().Game.currentRound >= getGame().Game.numRounds) {
      broadcastMessage(message);
      return;
    }

    // The current drawer cannot chat
    if (getGame().Game.isDrawer(username)) {
      return;
    }

    // Compare the lower-cased versions
    var guess = message.text.toLowerCase();
    var topic = prompts[0].toLowerCase();
    var filteredGuess = guess.replace(/[\W_]/g, ''); // only keep letters and numbers
    var filteredTopic = topic.replace(/[\W_]/g, '');
    if (filteredGuess === filteredTopic) {
      // Correct guess
      message.created = Date.now();
      message.class = 'correct-guess';

      // Send user's guess to the drawer/s
      message.addon = 'This guess is correct!';
      getGame().Game.getDrawers().forEach(function (drawer) {
        io.to(socketToRoom[socket.id]+'/'+drawer).emit('gameMessage', message);
      });

      // Send the user's guess to themselves
      message.addon = 'Your guess is correct!';
      socket.emit('gameMessage', message);

      // Don't update game state if user has already guessed the prompt
      if (getGame().Game.userHasGuessed(username)) {
        return;
      }

      // Mark user as correct and increase their score
      getGame().Game.markCorrectGuess(username);
      io.to(socketToRoom[socket.id]).emit('markCorrectGuess', username); // tell clients to update the score too

      // Alert everyone in the room that the guesser was correct
      broadcastMessage({
        class: 'status',
        text: '<b>' + username + '</b>' + ' has guessed the prompt!'
      });

      // End round if everyone has guessed
      if (getGame().Game.allGuessed()) {
        broadcastMessage({
          class: 'status',
          text: 'Round over! Everyone has guessed correctly!'
        });
        getGame().timerTop.pause();
        getGame().timerBot.pause();
        getGame().timerRemind.pause();
        advanceRound();
      } else if (getGame().Game.correctGuesses === 1) {
        // Start timer to end round if this is the first correct guess
        broadcastMessage({
          class: 'status',
          text: "The round will end in " + getGame().Game.timeAfterGuess + " seconds."
        });
        io.to(socketToRoom[socket.id]).emit('switchTimer');
        getGame().timerTop.pause();
        getGame().timerRemind.pause();
        getGame().timerBot.restart(timesUp.bind(null, getGame(), socketToRoom[socket.id]), getGame().Game.timeAfterGuess * 1000);
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
        getGame().Game.getDrawers().forEach(function (drawer) {
          io.to(socketToRoom[socket.id]+'/'+drawer).emit('gameMessage', message);
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
    if (!getGame().Game.started) {
      return;
    }

    if (getGame().Game.isDrawer(username)) {
      if (message.type === 'clear') {
        getGame().drawHistory = [];
      } else {
        getGame().drawHistory.push(message);
      }

      // Emit the 'canvasMessage' event
      socket.broadcast.to(socketToRoom[socket.id]).emit('canvasMessage', message);
    }

    // At the end of the game everyone can draw but not clear
    if (getGame().Game.finished) {
      getGame().drawHistory.push(message);
      socket.broadcast.to(socketToRoom[socket.id]).emit('canvasMessage', message);
    }
  });

  // Current drawer has finished drawing
  socket.on('finishDrawing', function () {
    if (!getGame().Game.started) {
      return;
    }

    // If the user who submitted this message actually is a drawer
    // And prevent round ending prematurely when prompt has been guessed
    if (getGame().Game.isDrawer(username) && getGame().Game.correctGuesses === 0) {
      giveUp();
    }
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', leaveRoom);
};
