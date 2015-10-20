'use strict';

// Create the 'lobby' controller
angular.module('lobby').controller('LobbyController', ['$scope', '$location', 'Authentication', 'PlayerConstants',
  function ($scope, $location, Authentication, PlayerConstants) {
    // If user is not signed in then redirect to signin page
    if (!Authentication.user) {
      $location.path('/authentication/signin');
    } else {
      $scope.username = Authentication.user.username;
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
  }
]);
