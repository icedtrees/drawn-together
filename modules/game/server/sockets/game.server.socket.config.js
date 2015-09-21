'use strict';

// TODO Change this from an in-memory store into actual database stuff
// Array of users in a queue
var users = [];
// Dictionary counting number of connects made by each user
var userConnects = {};

function getUserList(users) {
  var userList = [];
  var NUM_DRAWERS = 1;
  for (var i = 0; i < users.length; i++) {
    userList.push({username: users[i], drawer: false});
    if (i < NUM_DRAWERS) {
      userList[i].drawer = true;
    }
  }

  return userList;
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
    io.emit('gameMessage', {
      type: 'status',
      text: 'Is now connected',
      created: Date.now(),
      profileImageURL: socket.request.user.profileImageURL,
      username: username
    });

    // Notify everyone about the new joined user
    io.emit('userUpdate', getUserList(users));
  }

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function () {
    // Send a list of connected userConnects
    socket.emit('userUpdate', getUserList(users));
  });

  // Send a chat messages to all connected sockets when a message is received
  socket.on('gameMessage', function (message) {
    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = username;

    // Emit the 'gameMessage' event
    io.emit('gameMessage', message);
  });

  // Current drawer has finished drawing
  socket.on('finishDrawing', function () {
    // If the user who submitted this message actually is a drawer
    // TODO expand to multiple drawers
    if (users.length > 0 && users[0] === username) {
      users.push(users.shift());

      // Send user list with updated drawers
      io.emit('userUpdate', getUserList(users));
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
      io.emit('gameMessage', {
        type: 'status',
        text: 'disconnected',
        created: Date.now(),
        username: username
      });

      // Send updated list of userConnects now that one has disconnected
      io.emit('userUpdate', getUserList(users));
    }
  });
};