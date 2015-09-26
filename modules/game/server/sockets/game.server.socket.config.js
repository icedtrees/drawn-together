'use strict';

// Levenshtein-Damerau distance library (for calculating distance between words)
var ld = require('levenshtein-damerau');

var NUM_DRAWERS = 1;
// Array of users in a queue. First NUM_DRAWERS users are drawers
var users = [];
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
 *     stroke: colour code
 *   },
 *   {
 *     type: 'rect'
 *     x: last x pos
 *     y: last y pos
 *     width: cur x pos
 *     height: cur y pos
 *     fill: colour code
 *     stroke: colour code
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

/*
 * Transforms an array of usernames into an array of
 * [
 *   {
 *     username: name
 *     drawer: true|false
 *   }
 * ]
 * based on their position in the queue (first NUM_DRAWERS
 * usernames are drawers).
 */

function getUserList(users) {
  var userList = [];
  for (var i = 0; i < users.length; i++) {
    userList.push({username: users[i], drawer: false});
    if (i < NUM_DRAWERS) {
      userList[i].drawer = true;
    }
  }

  return userList;
}

/*
 * Returns true if the given username is a current drawer, false otherwise
 */
function isDrawer(users, username) {
  for (var i = 0; i < users.length && i < NUM_DRAWERS; i++) {
    if (users[i] === username) {
      return true;
    }
  }
  return false;
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
    users.push(username);

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
    socket.broadcast.emit('userUpdate', getUserList(users));
  }

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function () {
    // Send a list of connected userConnects
    socket.emit('userUpdate', getUserList(users));
    // Send the chat message history to the user
    gameMessages.forEach(function(message) {
      socket.emit('gameMessage', message);
    });
    // Send the draw history to the user
    socket.emit('updateDrawHistory', drawHistory);
    if (isDrawer(users, username)) {
      socket.emit('topic', topicList[0]);
    }
  });
  
  // Send a chat message to all connected sockets when a message is received
  socket.on('gameMessage', function (message) {
    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = username;

    // Remove punctuation and spaces from message and convert to lowercase.
    var guess = message.text.toLowerCase().replace(/[^\w]/g, "");

    if (guess === topicList[0]) {
      // correct guess
      
      // send the user's guess to themselves
      // TODO their message should be greyed out or something to indicate only they can see it
      socket.emit('gameMessage', message);

      // TODO send user's guess to the drawer/s

      // alert everyone in the room that they were correct
      message.text = message.username + " has guessed the prompt!";
      io.emit('gameMessage', message);
    } else if (guess.indexOf(topicList[0]) > -1 || ld(topicList[0], guess) < 3) {
      // if message contains drawing prompt or word-distance is < 3 it is a close guess

      // tell the guesser that their guess was close
      // TODO their message should be greyed out or something to indicate only they can see it
      message.text += "\nYour guess is close!";
      socket.emit('gameMessage', message);

      // TODO tell the drawer/s the guess
    } else {
      // incorrect guess: emit message to everyone
      gameMessages.push(message);

      io.emit('gameMessage', message);
    }
  });

  // Send a canvas drawing command to all connected sockets when a message is received
  socket.on('canvasMessage', function (message) {
    if (isDrawer(users, username)) {
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
    if (isDrawer(users, username)) {
      users.push(users.shift());

      // Send user list with updated drawers
      io.emit('userUpdate', getUserList(users));

      io.emit('canvasMessage', {type: 'clear'});
      drawHistory = [];

      // Select a new topic and send it to the new drawer
      topicList.push(topicList.shift());
      for (var i = 0; i < NUM_DRAWERS; i++) {
        io.to(users[i]).emit('topic', topicList[0]);
      }
    }
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', function () {
    userConnects[username]--;
    if (userConnects[username] === 0) {
      delete userConnects[username];
      var idx = users.indexOf(username);
      if (idx !== -1) {
        users.splice(idx, 1);
      }

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

      // Send updated list of userConnects now that one has disconnected
      io.emit('userUpdate', getUserList(users));
    }
  });
};
