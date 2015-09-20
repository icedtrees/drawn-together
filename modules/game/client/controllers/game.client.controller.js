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
    if (!Socket.socket) {
      Socket.connect();
    }

    // Add an event listener to the 'gameMessage' event
    Socket.on('gameMessage', function (message) {
      $scope.messages.unshift(message);
      if ($scope.messages.length > GameSettings.getMaxMessages()) {
        $scope.messages.pop();
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
