'use strict';

// Create the 'game' controller
angular.module('game').controller('GameController', ['$scope', '$location', 'Authentication', 'Socket', 'GameSettings',
  function ($scope, $location, Authentication, Socket, GameSettings) {
    // Create a messages array
    $scope.messages = [];
    $scope.users = [];
    $scope.canvas = null;

    var MAX_MESSAGES = 12; // maximum number of messages

    // If user is not signed in then redirect back home
    if (!Authentication.user) {
      $location.path('/');
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect();
    } else {
      // We are already connected but in a new window - request to be brought up to scratch
      Socket.emit('requestState');
    }

    /* Add an event listener to the 'gameMessage' event
     *
     * message =
     * {
     *   type: 'message' or 'status'
     *   created: Date.now()
     *   profileImageURL: some valid url
     *   username: user who posted the message
     * }
     */
    Socket.on('gameMessage', function (message) {
      $scope.messages.unshift(message);

      // delete old messages if MAX_MESSAGES is exceeded
      if ($scope.messages.length > MAX_MESSAGES) {
        $scope.messages.pop();
      }
    });

    /*
     * var message =
     * {
     *   lastX: last X position of cursor on the canvas
     *   lastY: last Y position
     *   currentX: current X position
     *   currentY: current Y position
     * };
     */
    Socket.on('canvasMessage', function (message) {
      if ($scope.canvas) {
        $scope.canvas.draw(message.lastX, message.lastY, message.currentX, message.currentY);
      }
    });

    /* Add an event listener to the 'userUpdate' event
     *
     * data =
     * [
     *   {
     *     username: string
     *     drawer: bool
     *   }
     * ]
     */
    Socket.on('userUpdate', function (data) {
      $scope.users = data.sort(function (a, b) {
        return a.username > b.username;
      });
    });

    // Create a controller method for sending messages
    $scope.sendMessage = function () {
      // Create a new message object
      var message = {
        text: this.messageText
      };

      // Emit a 'gameMessage' message event
      Socket.emit('gameMessage', message);

      // Clear the message text
      this.messageText = '';
    };

    // Returns true if we are currently the drawer and false otherwise
    $scope.isDrawer = function () {
      for (var i = 0; i < $scope.users.length; i++) {
        if ($scope.users[i].username === Authentication.user.username && $scope.users[i].drawer) {
          return true;
        }
      }
      return false;
    };

    // Send a 'finished drawing' message to the server. Must be the current drawer
    $scope.finishDrawing = function () {
      if ($scope.isDrawer()) {
        Socket.emit('finishDrawing');
      }
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('gameMessage');
      //Socket.removeListener('userUpdate');
    });
  }
]);
