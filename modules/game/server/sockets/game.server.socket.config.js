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

// Socket id to room name
var socketToRoom = {};

// List of all rooms
var rooms = [];

function checkRoomName(room) {
  var result = {
    valid: false
  };
  if (typeof(room) !== 'string') {
    result.error = 'Room name must be a string';
    return result;
  }

  if (room.length < 1 || room.length > GameSettings.MAX_ROOM_NAME_LENGTH) {
    result.error = 'Room name must be between 1 and ' + GameSettings.MAX_ROOM_NAME_LENGTH + ' characters';
    return result;
  }

  if (/^\s*$/.test(room)) {
    result.error = 'Room name must not be empty';
    return result;
  }

  result.valid = true;
  return result;
}

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
  function broadcastMessage(message, game, room) {
    message.created = Date.now();
    game.messageHistory.push(message);
    if (game.messageHistory.length > ChatSettings.MAX_MESSAGES) {
      game.messageHistory.shift();
    }
    io.to(room).emit('gameMessage', message);
  }

  function sendTopic(game, room) {
    // Select a new topic and send it to the new drawer
    game.prompts.push(game.prompts.shift());
    game.Game.getDrawers().forEach(function (drawer) {
      io.to(room+'/'+drawer).emit('topic', game.prompts[0]);
    });

    // Announce the new drawers
    var newDrawersAre = Utils.toCommaListIs(Utils.boldList(game.Game.getDrawers()));
    broadcastMessage({
      class: 'status',
      text: newDrawersAre + ' now drawing'
    }, game, room);
  }

  function advanceRound(game, room) {
    var gameFinished = game.Game.advanceRound();

    // Send user list with updated drawers
    io.to(room).emit('advanceRound');

    io.to(room).emit('canvasMessage', {type: 'clear'});
    game.drawHistory = [];

    // Explain what the word was
    broadcastMessage({
      class: 'status',
      text: 'The prompt was "' + game.prompts[0] + '"'
    }, game, room);

    if (gameFinished) {
      var winners = game.Game.getWinners();
      broadcastMessage({
        class: 'status',
        text: Utils.toCommaList(Utils.boldList(winners)) + ' won the game on ' +
              game.Game.users[winners[0]].score + ' points! A new game will start ' +
              'in ' + GameSettings.TIME_BETWEEN_GAMES + ' seconds'
      }, game, room);
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
      game.drawHistory.push(JSON.parse(JSON.stringify(message))); // push deep copy because we modify the message below
      io.to(room).emit('canvasMessage', message);

      message.y += 50;
      for (var i = 0; i < winners.length; i++) {
        message.text = winners[i];
        game.drawHistory.push(JSON.parse(JSON.stringify(message)));
        io.to(room).emit('canvasMessage', message);
        message.y += 50;
      }

      message.align = 'center';
      message.y = 500;
      message.text = 'Please respect the other contestants';
      game.drawHistory.push(JSON.parse(JSON.stringify(message)));
      io.to(room).emit('canvasMessage', message);
      message.y += 35;
      message.text = 'and do not deface this message';
      game.drawHistory.push(JSON.parse(JSON.stringify(message)));
      io.to(room).emit('canvasMessage', message);

      setTimeout(function () {
        game.timerTop.pause();
        game.timerBot.pause();
        game.timerRemind.pause();
        game.drawHistory = [];
        game.Game.resetGame();
        io.to(room).emit('resetGame');
      }, GameSettings.TIME_BETWEEN_GAMES * 1000);
    } else {
      startRound(game, room);
    }
  }

  function startRound(game, room) {
    sendTopic(game, room);
    broadcastMessage({
      class: 'status',
      text: game.Game.roundTime + " seconds to draw."
    }, game, room);

    game.timerTop.restart(timesUp.bind(null, game, room), game.Game.roundTime * 1000);
    game.timerRemind.restart(function () {
      broadcastMessage({
        class: 'status',
        text: '10 seconds left!'
      }, game, room);
    }, (game.Game.roundTime - 10) * 1000);
    game.timerBot.delay = game.Game.timeAfterGuess * 1000;
  }

  function giveUp(game, room) {
    if (!game.Game.started) {
      return;
    }

    broadcastMessage({
      class: 'status',
      text: '<b>' + username + '</b>' + ' has given up'
    }, game, room);
    advanceRound(game, room);
  }

  function timesUp(game, room) {
    game = game || game;
    var Game = game.Game;
    room = room || socketToRoom[socket.id];

    broadcastMessage({
      class: 'status',
      text: Game.correctGuesses === 0 ? "Time's up! No one guessed " + Game.getDrawers()[0] + "'s drawing" : 'Round over!'
    }, game, room);

    advanceRound(game, room);
  }

  var username = socket.request.user.username;
  var profileImageURL = socket.request.user.profileImageURL;

  // Join a room
  function joinRoom (room) {
    if (!checkRoomName(room)) {
      return false;
    }

    // This socket is already part of a room
    if (socket.id in socketToRoom) {
      // Already in this room
      if (socketToRoom[socket.id] === room) {
        return;
      } else {
        // In another room at the moment - leave that room first
        leaveRoom();
      }
    }

    // Create the room and the game if it doesn't exist
    var game;
    if (!(room in games)) {
      games[room] = {};
      game = games[room];
      game.Game = new GameLogic.Game({
        numRounds: GameSettings.numRounds.default,
        numDrawers: 1,
        roundTime: GameSettings.roundTime.default,
        timeAfterGuess: GameSettings.timeAfterGuess.default,
        topicListName: TopicSettings.topicListName.default,
        topicListDifficulty: TopicSettings.topicListDifficulty.default
      });
      game.drawHistory = [];
      game.messageHistory = [];

      // Server timer
      game.timerTop = new Utils.Timer();
      game.timerBot = new Utils.Timer();
      game.timerRemind = new Utils.Timer();

      // Add to room list
      var newRoom = {
        name: room,
        host: username,
        topic: game.Game.topicListName + ' (' + game.Game.topicListDifficulty + ')',
        numPlayers: 0,
        maxNumPlayers: GameSettings.MAX_NUM_PLAYERS
      };
      rooms.push(newRoom);
      io.emit('changeRoom', newRoom);
    } else {
      game = games[room];
    }

    // Cannot join if already full
    if (game.numPlayers >= game.maxNumPlayers) {
      return false;
    }

    // Join the room as well as the room specific username grouping
    socket.join(room);
    socket.join(room+'/'+username);
    socketToRoom[socket.id] = room;

    // Add user to in-memory store if necessary, or simply increment counter
    // to account for multiple windows open
    if (username in game.Game.users) {
      game.Game.users[username].connects++;
    } else {
      game.Game.addUser(username, profileImageURL);
      game.Game.users[username].connects = 1;

      // Increase number of players in room
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name === room) {
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
      game.messageHistory.push(message);
      if (game.messageHistory.length > ChatSettings.MAX_MESSAGES) {
        game.messageHistory.shift();
      }
      socket.broadcast.to(room).emit('gameMessage', message);

      // Notify everyone about the new joined user (not the sender though)
      socket.broadcast.to(room).emit('userConnect', {
        username: username,
        image: profileImageURL
      });
    }
    return true;
  }

  function leaveRoom () {
    var room = socketToRoom[socket.id];
    var game = games[room];
    if (!room) {
      return;
    }

    game.Game.users[username].connects--;
    if (game.Game.users[username].connects === 0) {
      // Emit the status event when a socket client is disconnected
      broadcastMessage({
        class: 'status',
        text: '<b>'+username+'</b>' + ' is now disconnected'
      }, game, room);

      // Decrease number of players in room
      var roomIndex;
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name === room) {
          rooms[i].numPlayers--;
          roomIndex = i;
          break;
        }
      }

      // If the disconnecting user is a drawer, this is equivalent to
      // 'giving up' or passing
      if (game.Game.started && game.Game.isDrawer(username)) {
        giveUp(game, room);
      }
      var oldHost = game.Game.getHost();
      game.Game.removeUser(username);
      var newHost = game.Game.getHost();
      if (newHost !== oldHost) {
        rooms[roomIndex].host = newHost;
      }
      io.emit('changeRoom', rooms[roomIndex]);

      // Notify all users that this user has disconnected
      io.to(room).emit('userDisconnect', username);

      // If there are no users left, destroy this game instance
      if (game.Game.userList.length === 0) {
        game.timerTop.pause();
        game.timerBot.pause();
        game.timerRemind.pause();

        delete games[room];
        rooms.splice(roomIndex, 1);
      }
    }

    socket.leave(room);
    socket.leave(room+'/'+username);
    delete socketToRoom[socket.id];
  }
  socket.on('leaveRoom', leaveRoom);

  socket.on('requestRooms', function () {
    socket.emit('requestRooms', rooms);
  });

  socket.on('checkRoomName', function (room) {
    var result = checkRoomName(room);
    if (room in games) {
      socket.emit('invalidRoomName', '"'+roomName+'"' + ' is already taken, sorry');
    } else if (!result.valid) {
      socket.emit('invalidRoomName', result.error);
    } else {
      socket.emit('validRoomName', room);
    }
  });

  // Start the game
  socket.on('startGame', function () {
    var room = socketToRoom[socket.id];
    if (!room) {
      return;
    }
    var game = games[room];

    if (!game.Game.started && username === game.Game.getHost()) {
      game.prompts = TopicList.getTopicWords(game.Game.topicListName, game.Game.topicListDifficulty);
      ServerUtils.shuffleWords(game.prompts);
      game.Game.startGame();
      io.to(room).emit('startGame');
      startRound(game, room);
    }
  });

  // Change a game setting as the host
  socket.on('changeSetting', function (change) {
    var room = socketToRoom[socket.id];
    if (!room) {
      return;
    }
    var game = games[room];

    if (!game.Game.started && username === game.Game.getHost()) {
      // make sure change uses one of the options given
      if ((GameSettings[change.setting] && GameSettings[change.setting].options.indexOf(change.option) === -1) ||
          (TopicSettings[change.setting] && TopicSettings[change.setting].options.indexOf(change.option) === -1)) {
        return;
      }

      // apply settings selected by host
      game.Game[change.setting] = change.option;

      // If its a topic change, update room list
      if (change.setting === 'topicListName' || change.setting === 'topicListDifficulty') {
        for (var i = 0; i < rooms.length; i++) {
          if (rooms[i].name === room) {
            rooms[i].topic = game.Game.topicListName + ' (' + game.Game.topicListDifficulty + ')';
            io.emit('changeRoom', rooms[i]);
            break;
          }
        }
      }

      // tell all clients about the new setting
      io.to(room).emit('updateSetting', change);
    }
  });

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function (requestedRoom) {
    var room = socketToRoom[socket.id];
    if (room !== requestedRoom) {
      if (joinRoom(requestedRoom)) {
        room = requestedRoom;
      } else {
        return;
      }
    }
    var game = games[room];

    // Send current game state
    socket.emit('gameState', game.Game);

    // Send the chat message history to the user
    socket.emit('gameMessage', game.messageHistory);

    // Send the draw history to the user
    socket.emit('canvasMessage', game.drawHistory);

    // Send time left to the user
    socket.emit('updateTime', {
      timerTop: {delay: game.timerTop.timeLeft(), paused: game.timerTop.paused},
      timerBot: {delay: game.timerBot.timeLeft(), paused: game.timerBot.paused}
    });

    // Send current topic if they are the drawer
    if (game.Game.isDrawer(username)) {
      socket.emit('topic', game.prompts[0]);
    }
  });

  // Handle chat messages
  socket.on('gameMessage', function (message) {
    var room = socketToRoom[socket.id];
    if (!room) {
      return;
    }
    var game = games[room];

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
    if (!game.Game.started || game.Game.currentRound >= game.Game.numRounds) {
      broadcastMessage(message, game, room);
      return;
    }

    // The current drawer cannot chat
    if (game.Game.isDrawer(username)) {
      return;
    }

    // Compare the lower-cased versions
    var guess = message.text.toLowerCase();
    var topic = game.prompts[0].toLowerCase();
    var filteredGuess = guess.replace(/[\W_]/g, ''); // only keep letters and numbers
    var filteredTopic = topic.replace(/[\W_]/g, '');
    if (filteredGuess === filteredTopic) {
      // Correct guess
      message.created = Date.now();
      message.class = 'correct-guess';

      // Send user's guess to the drawer/s
      message.addon = 'This guess is correct!';
      game.Game.getDrawers().forEach(function (drawer) {
        io.to(room+'/'+drawer).emit('gameMessage', message);
      });

      // Send the user's guess to themselves
      message.addon = 'Your guess is correct!';
      socket.emit('gameMessage', message);

      // Don't update game state if user has already guessed the prompt
      if (game.Game.userHasGuessed(username)) {
        return;
      }

      // Mark user as correct and increase their score
      game.Game.markCorrectGuess(username);
      io.to(room).emit('markCorrectGuess', username); // tell clients to update the score too

      // Alert everyone in the room that the guesser was correct
      broadcastMessage({
        class: 'status',
        text: '<b>' + username + '</b>' + ' has guessed the prompt!'
      }, game, room);

      // End round if everyone has guessed
      if (game.Game.allGuessed()) {
        broadcastMessage({
          class: 'status',
          text: 'Round over! Everyone has guessed correctly!'
        }, game, room);
        game.timerTop.pause();
        game.timerBot.pause();
        game.timerRemind.pause();
        advanceRound(game, room);
      } else if (game.Game.correctGuesses === 1) {
        // Start timer to end round if this is the first correct guess
        broadcastMessage({
          class: 'status',
          text: "The round will end in " + game.Game.timeAfterGuess + " seconds."
        }, game, room);
        io.to(room).emit('switchTimer');
        game.timerTop.pause();
        game.timerRemind.pause();
        game.timerBot.restart(timesUp.bind(null, game, room), game.Game.timeAfterGuess * 1000);
      }

    } else {
      var guessResult = checkGuess(filteredGuess, filteredTopic);
      var matches = matchingWords(guess, topic);

      if (!guessResult.close && matches.length === 0) {
        // Incorrect guess: emit message to everyone
        broadcastMessage(message, game, room);
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
        game.Game.getDrawers().forEach(function (drawer) {
          io.to(room+'/'+drawer).emit('gameMessage', message);
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
    var room = socketToRoom[socket.id];
    if (!room) {
      return;
    }
    var game = games[room];

    if (!game.Game.started) {
      return;
    }

    if (game.Game.isDrawer(username)) {
      if (message.type === 'clear') {
        game.drawHistory = [];
      } else {
        game.drawHistory.push(message);
      }

      // Emit the 'canvasMessage' event
      socket.broadcast.to(room).emit('canvasMessage', message);
    } else if (game.Game.finished && message.type !== 'clear') {
      // At the end of the game everyone can draw but not clear
      game.drawHistory.push(message);
      socket.broadcast.to(room).emit('canvasMessage', message);
    }
  });

  // Current drawer has finished drawing
  socket.on('finishDrawing', function () {
    var room = socketToRoom[socket.id];
    if (!room) {
      return;
    }
    var game = games[room];

    if (!game.Game.started) {
      return;
    }

    // If the user who submitted this message actually is a drawer
    // And prevent round ending prematurely when prompt has been guessed
    if (game.Game.isDrawer(username) && game.Game.correctGuesses === 0) {
      giveUp(game, room);
    }
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', leaveRoom);
};
