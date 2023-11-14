'use strict';

// Configure the 'lobby' module routes
angular.module('lobby').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/client/lobby/views/lobby.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
