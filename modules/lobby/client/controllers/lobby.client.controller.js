'use strict';

// Create the 'lobby' controller
angular.module('lobby').controller('LobbyController', ['$scope', '$location', '$state', 'Authentication', 'Socket', 'PlayerConstants',
  function ($scope, $location, $state, Authentication, Socket, PlayerConstants) {
    // If user is not signed in then redirect to signin page
    if (!Authentication.user) {
      $location.path('/authentication/signin');
    } else {
      $scope.username = Authentication.user.username;
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect();
    }

    $scope.rooms = [
      {
        'name': 'my room',
        'host': 'alice',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': PlayerConstants.MAX_NUM_PLAYERS
      },
      {
        'name': 'my room',
        'host': 'bob',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': PlayerConstants.MAX_NUM_PLAYERS
      },
      {
        'name': 'my room',
        'host': 'carol',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': PlayerConstants.MAX_NUM_PLAYERS
      },
      {
        'name': 'my room',
        'host': 'daniel',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': PlayerConstants.MAX_NUM_PLAYERS
      },
      {
        'name': 'retards unite',
        'host': 'claudia',
        'topic': 'something',
        'numplayers': 1,
        'maxnumplayers': PlayerConstants.MAX_NUM_PLAYERS
      }
    ];

    $scope.joinRoom = function (roomName) {
      // Request to join room
      Socket.emit('joinRoom', roomName);
    };

    Socket.on('joinRoom', function (roomName) {
      // Go to room view
      $state.go('game', {roomName: roomName});
    });
  }
]);
