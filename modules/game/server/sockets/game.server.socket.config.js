'use strict';

var ChatSettings = require('../../shared/config/game.shared.chat.config.js');
var GameLogic = require('../../shared/helpers/game.shared.gamelogic.js');

// cln_fuzzy library (for calculating distance between words)
var clj_fuzzy = require('clj-fuzzy');
var jaro_winkler = clj_fuzzy.metrics.jaro_winkler;
var porter = clj_fuzzy.stemmers.porter;
var levenshtein = clj_fuzzy.metrics.levenshtein;

// A timeout created to end the round seconds when someone guesses the prompt
var roundTimeout;
// Game object encapsulating game logic
var Game =  new GameLogic.Game(1, 20); // parameters: numDrawers, timeToEnd

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
var topicList = ['authorise', 'free', 'cat', 'breezy', 'chilled', 'best', 'sunset', 'postmortem', 'sunset', 'iced tea', 'fruit', 'top', 'mouse trap', 'handbag', 'oil', 'cat', 'whale', 'cockatoo', 'street light', 'dentist', 'bishop', 'supermarket', 'library', 'push up', 'screen', 'pillowcase', 'diamond', 'lunch', 'adventurer', 'skyscraper', 'lighthouse', 'birthday', 'healthy', 'carpet', 'dead end', 'puzzle', 'origami', 'zoo', 'ferry', 'tessellation', 'power', 'cycle', 'memory', 'freedom', 'fast food', 'secret', 'trap', 'youth', 'funny', 'scam', 'invite', 'late', 'cold war', 'lie', 'titanic', 'desert', 'tan', 'holiday', 'imagination', 'childhood', 'wealth'];
// Shuffle the topic list in-place using Knuth shuffle
for (var i = topicList.length - 2; i > 0; i--) {
  var j = Math.floor(Math.random() * i);
  var temp = topicList[j];
  topicList[j] = topicList[i];
  topicList[i] = temp;
}

function wordsClose(guess, topic) {
  var score = jaro_winkler(guess, topic);
  var t = 0.96;
  t = Math.max(0.90, t - guess.length / 125);
  console.log("t " + t);
  if (score < 0.8) { // Certainly wrong
    return [score, false];
  } else if (score > t) { // Definitely close
    return [score, true];
  } else { // Somewhat close
    var guessRoot = porter(guess);
    var topicRoot = porter(topic);
    console.log(guessRoot + " " + topicRoot);
    score = jaro_winkler(guessRoot, topicRoot);
    score -= levenshtein(guessRoot, topicRoot) / 60;
    if (score > t) {
      return [score, score > t];
    } else if (score < 0.8) {
      return [score, false];
    } else {
      var lev = levenshtein(guess, topic);
      return [score, lev <= (guess.length - 5)/3 + 1];
    }
  }
}

function advanceRound(io) {
  Game.advanceRound();

  // Send user list with updated drawers
  io.emit('advanceRound');

  io.emit('canvasMessage', {type: 'clear'});
  drawHistory = [];

  // Explain what the word was
  io.emit('gameMessage', {text: 'Round over! The topic was "' + topicList[0] + '"'});

  // Select a new topic and send it to the new drawer
  topicList.push(topicList.shift());
  Game.getDrawers().forEach(function (drawer) {
    io.to(drawer).emit('topic', topicList[0]);
  });

  // Announce the new drawers
  var drawers = Game.getDrawers();
  var newDrawers = drawers.length === 1 ? drawers[0] : drawers.slice(0, drawers.length - 1).join(", ") +
      " and " + drawers[drawers.length - 1];
  io.emit('gameMessage', {text: newDrawers + (drawers.length === 1 ? ' is' : ' are') + ' now drawing.'});
}

// Create the game configuration
module.exports = function (io, socket) {
  var username = socket.request.user.username;
  socket.join(username);

  // Add user to in-memory store if necessary, or simply increment counter
  // to account for multiple windows open
  if (username in userConnects) {
    userConnects[username]++;
  } else {
    userConnects[username] = 1;
    Game.addUser(username);

    // Emit the status event when a new socket client is connected
    var message = {
      type: 'status',
      text: 'is now connected',
      created: Date.now(),
      profileImageURL: socket.request.user.profileImageURL,
      username: username
    };
    gameMessages.push(message);
    socket.broadcast.emit('gameMessage', message);

    // Notify everyone about the new joined user (not the sender though)
    socket.broadcast.emit('userConnect', username);
  }

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function () {
    // Send current game state
    socket.emit('gameState', Game.getState());

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
    // The current drawer cannot chat
    if (Game.isDrawer(username)) {
      return;
    }

    // Disallow messages that are empty or longer than MAX_MSG_LEN characters
    if (message.text.length > ChatSettings.MAX_MSG_LEN || /^\s*$/.test(message.text)) {
      return;
    }

    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = username;

    // Compare the lower-cased versions
    var guess = message.text.toLowerCase();
    var topic = topicList[0].toLowerCase();

    if (guess === topic) {
      // Correct guess

      // Send user's guess to the drawer/s
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // Send the user's guess to themselves
      // TODO their message should be greyed out or something to indicate only they can see it
      socket.emit('gameMessage', message);

      // Don't update game state if user has already guessed the prompt
      if (Game.userHasGuessed(username)) {
          return;
      }

      // Mark user as correct and increase their score
      Game.markCorrectGuess(username);

      // Alert everyone in the room that they were correct
      io.emit('gameMessage', {text: username + " has guessed the prompt!"});

      // End round if everyone has guessed
      if (Game.allGuessed()) {
        clearTimeout(roundTimeout);
        advanceRound(io);
      } else if (Game.correctGuesses === 1) {
        // Start timer to end round if this is the first correct guess
        io.emit('gameMessage', {text: "The round will end in " + Game.timeToEnd + " seconds."});
        roundTimeout = setTimeout(function () {
          advanceRound(io);
        }, Game.timeToEnd * 1000);
      }

    } else if (wordsClose(guess, topic)[1]) { 
      // close guess
      
      // Tell the drawer/s the guess
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // Tell the guesser that their guess was close
      // TODO their message should be greyed out or something to indicate only they can see it
      socket.emit('gameMessage', message);
      if (!Game.userHasGuessed(username)) {
        socket.emit('gameMessage', {text: '"' + guess + '" is close! (' +wordsClose(guess, topic)[0] + ')'});
      }
    } else {
      // Incorrect guess: emit message to everyone
      gameMessages.push(message);
      if (gameMessages.length > ChatSettings.MAX_MESSAGES) {
        gameMessages.shift();
      }

      io.emit('gameMessage', message);
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
      advanceRound(io);
    }
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', function () {
    userConnects[username]--;
    if (userConnects[username] === 0) {
      delete userConnects[username];
      Game.removeUser(username);

      // Emit the status event when a socket client is disconnected
      var message = {
        type: 'status',
        text: 'is now disconnected',
        created: Date.now(),
        profileImageURL: socket.request.user.profileImageURL,
        username: username
      };
      gameMessages.push(message);
      io.emit('gameMessage', message);

      // Notify all users that this user has disconnected
      io.emit('userDisconnect', username);
    }
  });
};
