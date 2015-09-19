'use strict';

// TODO Change this from an in-memory store into actual database stuff
var users = {};

// Create the chat configuration
module.exports = function (io, socket) {
  var username = socket.request.user.username;

  // Add user to in-memory store if necessary, or simply increment counter
  // to account for multiple windows open
  if (username in users) {
    users[username]++;
  } else {
    users[username] = 1;

    // Emit the status event when a new socket client is connected
    io.emit('gameMessage', {
      type: 'status',
      text: 'Is now connected',
      created: Date.now(),
      profileImageURL: socket.request.user.profileImageURL,
      username: username
    });

    // Send a list of connected users
    io.emit('gameMessage', {
      type: 'userlist',
      data: Object.keys(users).sort()
    });
  }

  // Send a chat messages to all connected sockets when a message is received
  socket.on('gameMessage', function (message) {
    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = username;

    // Emit the 'gameMessage' event
    io.emit('gameMessage', message);
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', function () {
    users[username]--;
    if (users[username] === 0) {
      delete users[username];

      // Emit the status event when a socket client is disconnected
      io.emit('gameMessage', {
        type: 'status',
        text: 'disconnected',
        created: Date.now(),
        username: username
      });

      // Send updated list of users now that one has disconnected
      io.emit('gameMessage', {
        type: 'userlist',
        data: Object.keys(users).sort()
      });
    }
  });
};
