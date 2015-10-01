'use strict';

// Create the 'game' controller
angular.module('game').controller('GameController', ['$scope', '$location', 'Authentication', 'Socket', 'CanvasSettings', 'ChatSettings', 'GameSettings',
  function ($scope, $location, Authentication, Socket, CanvasSettings, ChatSettings, GameSettings) {
    // Create a messages array
    $scope.messages = [];
    $scope.users = [];
    $scope.canvas = null;
    $scope.penColour = CanvasSettings.DEFAULT_PEN_COLOUR;
    $scope.penWidth = CanvasSettings.DEFAULT_PEN_WIDTH;
    $scope.eraserWidth = CanvasSettings.DEFAULT_ERASER_WIDTH;
    $scope.mouseMode = 'pen';

    $scope.CanvasSettings = CanvasSettings;
    $scope.ChatSettings = ChatSettings;
    $scope.GameSettings = GameSettings;

    // Left, middle, right mouse button is down, respectively
    $scope.mouseState = [false, false, false];
    $scope.messageText = '';

    // If user is not signed in then redirect to signin page
    if (!Authentication.user) {
      $location.path('/authentication/signin');
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect(function () {
        Socket.emit('requestState');
      });
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
      $scope.messages.push(message);

      // delete old messages if MAX_MESSAGES is exceeded
      if ($scope.messages.length > ChatSettings.MAX_MESSAGES) {
        $scope.messages.shift();
      }
    });

    /*
     * var message =
     * {
     *   x1: last X position of cursor on the canvas
     *   y1: last Y position
     *   x2: current X position
     *   y2: current Y position
     * };
     */
    Socket.on('canvasMessage', function (message) {
      if ($scope.canvas) {
        $scope.canvas.draw(message);
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

    Socket.on('updateDrawHistory', function (drawHistory) {
      drawHistory.forEach(function(message) {
        $scope.canvas.draw(message);
      });
    });

    Socket.on('topic', function (topic) {
      $scope.topic = topic;
    });

    // Create a controller method for sending messages
    $scope.sendMessage = function () {
      // Disallow empty messages
      if (/^\s*$/.test($scope.messageText)) {
        $scope.messageText = '';
        return;
      }

      // Create a new message object
      var message = {
        text: $scope.messageText
      };

      // Emit a 'gameMessage' message event
      Socket.emit('gameMessage', message);

      // Clear the message text
      $scope.messageText = '';
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

    $scope.clearDrawing = function () {
      if ($scope.isDrawer()) {
        var message = {
          type: 'clear',
        };
        $scope.canvas.draw(message);
        Socket.emit('canvasMessage', message);
      }
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('gameMessage');
      Socket.removeListener('canvasMessage');
      Socket.removeListener('userUpdate');
      Socket.removeListener('updateDrawHistory');
    });
  }
]);
