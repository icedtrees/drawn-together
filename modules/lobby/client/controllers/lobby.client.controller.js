'use strict';

// Create the 'lobby' controller
angular.module('lobby').controller('LobbyController', ['$scope', '$location', 'Authentication',
  function ($scope, $location, Authentication) {
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
        'maxnumplayers': MAX_NUM_PLAYERS
      },
      {
        'name': 'my room',
        'host': 'bob',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': MAX_NUM_PLAYERS
      },
      {
        'name': 'my room',
        'host': 'carol',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': MAX_NUM_PLAYERS
      },
      {
        'name': 'my room',
        'host': 'daniel',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': MAX_NUM_PLAYERS
      },
      {
        'name': 'retards unite',
        'host': 'claudia',
        'topic': 'something',
        'numplayers': 1,
        'maxnumplayers': MAX_NUM_PLAYERS
      }
    ];
  }
]);
