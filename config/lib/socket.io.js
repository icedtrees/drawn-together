'use strict';

// Load the module dependencies
var path = require('path'),
  http = require('http'),
  socketio = require('socket.io');

var rootDir = path.resolve(__dirname, '..', '..');

var socketModules = [
  path.join(rootDir, 'modules/server/game/sockets/game.server.socket.config.js')
];

// Define the Socket.io configuration method
module.exports = function (app) {
  // Create a new HTTP server
  var server = http.createServer(app);

  // Create a new Socket.io server
  var io = socketio.listen(server);

  const sessionMiddleware = app.get('sessionMiddleware');

  // Intercept Socket.io's handshake request
  io.use(function (socket, next) {
    if (!sessionMiddleware) {
      return next(new Error('Session middleware is not configured'));
    }

    sessionMiddleware(socket.request, {}, function () {
      const user = socket.request.session ? socket.request.session.user : null;
      if (user) {
        socket.request.user = user;
        return next();
      }
      return next(new Error('User is not authenticated'));
    });
  });

  // Add an event listener to the 'connection' event
  io.on('connection', function (socket) {
    socketModules.forEach(function (socketModule) {
      require(socketModule)(io, socket);
      socket.on('error', function(e) { console.log("socket1 error ", e); });
    });
  });
  io.on('error', function(e) { console.log("io error ", e); });

  return server;
};
