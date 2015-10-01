'use strict';

var ChatSettings = require('../../shared/config/game.shared.chat.config.js');
var GameLogic = require('../../shared/helpers/game.shared.gamelogic.js');

// Levenshtein distance library (for calculating distance between words)
var levenshtein = require('fast-levenshtein');

// Game object encapsulating game logic
var Game =  new GameLogic.Game(1);

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
var topicList = ['sunset', 'iced tea', 'fruit', 'top', 'mouse trap'];
// Shuffle the topic list in-place using Knuth shuffle
for (var i = topicList.length - 2; i > 0; i--) {
  var j = Math.floor(Math.random() * i);
  var temp = topicList[j];
  topicList[j] = topicList[i];
  topicList[i] = temp;
}

// If the word has been guessed and round is ending
var roundEnding = false;

function advanceRound(io) {
  if (roundEnding) {
    Game.advanceRound();

    // Send user list with updated drawers
    io.emit('advanceRound');

    io.emit('canvasMessage', {type: 'clear'});
    drawHistory = [];

    // Explain what the word was
    io.emit('gameMessage', {
      type: 'status',
      text: 'The topic was ' + topicList[0]
    });

    // Select a new topic and send it to the new drawer
    topicList.push(topicList.shift());
    Game.getDrawers().forEach(function (drawer) {
      io.to(drawer).emit('topic', topicList[0]);
    });
  }

  roundEnding = false;
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
  
  // Send a chat message to all connected sockets when a message is received
  socket.on('gameMessage', function (message) {
    // The current drawer cannot chat
    if (Game.isDrawer(username)) {
      return;
    }

    // Disallow empty messages
    if (/^\s*$/.test(message.text)) {
      return;
    }

    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = username;

    // Compare the lower-cased versions
    var guess = message.text.toLowerCase();
    var topic = topicList[0].toLowerCase();

    var i;

    if (guess === topic) {
      // correct guess

      // send user's guess to the drawer/s
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // send the user's guess to themselves
      // TODO their message should be greyed out or something to indicate only they can see it
      message.type = 'correct-guess';
      socket.emit('gameMessage', message);

      var timeToEnd = 20;
      // alert everyone in the room that they were correct
      message.type = 'status';
      message.text = message.username + " has guessed the prompt! The round will end in " + timeToEnd + " seconds.";
      io.emit('gameMessage', message);

      // End the round in timeToEnd seconds
      if (!roundEnding) {
        roundEnding = true;
        setTimeout(function () {
          advanceRound(io);
        }, timeToEnd * 1000);
      }
    } else if (guess.indexOf(topic) > -1 || levenshtein.get(topic, guess) < 3) {
      // if message contains drawing prompt or word-distance is < 3 it is a close guess

      // tell the drawer/s the guess
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // tell the guesser that their guess was close
      // TODO their message should be greyed out or something to indicate only they can see it
      message.type = 'close-guess';
      message.text += "\nYour guess is close!";
      socket.emit('gameMessage', message);
    } else {
      // incorrect guess: emit message to everyone
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
    if (Game.isDrawer(username)) {
      roundEnding = true;
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
