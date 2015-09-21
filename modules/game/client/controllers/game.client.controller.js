'use strict';

// Create the 'game' controller
angular.module('game').controller('GameController', ['$scope', '$location', 'Authentication', 'Socket', 'GameSettings',
  function ($scope, $location, Authentication, Socket, GameSettings) {
    // Create a messages array
    $scope.messages = [];

    // If user is not signed in then redirect back home
    if (!Authentication.user) {
      $location.path('/');
    }

    // Make sure the Socket is connected
    console.log('socket??');
    if (!Socket.socket) {
      Socket.connect();
    } else {
      console.log('trying');
      Socket.emit('requestState', {});
    }

    // Add an event listener to the 'gameMessage' event
    Socket.on('gameMessage', function (message) {
      if (message.type === 'userlist') {
        $scope.userlist = message.data;
      } else if (message.type === 'message' || message.type === 'status') { // TODO handle status differently
        $scope.messages.unshift(message);
        if ($scope.messages.length > GameSettings.MAX_MESSAGES) {
          $scope.messages.pop();
        }
      } else {
        console.log('Message type', message.type, 'unknown:', message);
      }
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

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('gameMessage');
    });
  }
]);
