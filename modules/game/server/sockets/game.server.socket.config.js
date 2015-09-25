'use strict';

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

var drawingPrompt = "whale";

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

// Create the chat configuration
module.exports = function (io, socket) {
  var username = socket.request.user.username;

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
      text: 'Is now connected',
      created: Date.now(),
      profileImageURL: socket.request.user.profileImageURL,
      username: username
    };
    gameMessages.push(message);
    io.emit('gameMessage', message);

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
  });
  
  // Send a chat messages to all connected sockets when a message is received
  socket.on('gameMessage', function (message) {
    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = username;

    if (message.text === drawingPrompt) {
      // correct guess: tell everyone that the guesser was right
      message.text = message.username + " has guesssed the prompt!";
      io.emit('gameMessage', message);
    } else if (message.text.indexOf(drawingPrompt) > -1) { // if message contains drawingPrompt
      // close guess: tell the guesser they are close
      message.text = "Your guess is close!";
      socket.emit('gameMessage', message);
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
        text: 'disconnected',
        created: Date.now(),
        username: username
      };
      gameMessages.push(message);
      io.emit('gameMessage', message);

      // Send updated list of userConnects now that one has disconnected
      io.emit('userUpdate', getUserList(users));
    }
  });
};
