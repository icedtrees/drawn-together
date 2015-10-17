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
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': 16
      },
      {
        'name': 'my room',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': 16
      },
      {
        'name': 'my room',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': 16
      },
      {
        'name': 'my room',
        'topic': 'fruit',
        'numplayers': 4,
        'maxnumplayers': 16
      },
      {
        'name': 'retards unite',
        'topic': 'something',
        'numplayers': 1,
        'maxnumplayers': 16
      }
    ];
  }
]);
