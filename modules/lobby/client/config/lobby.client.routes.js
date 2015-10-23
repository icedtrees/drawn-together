'use strict';

// Configure the 'lobby' module routes
angular.module('lobby').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('lobby', {
        url: '/lobby',
        templateUrl: 'modules/lobby/client/views/lobby.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
