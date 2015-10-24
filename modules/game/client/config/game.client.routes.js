'use strict';

// Configure the 'game' module routes
angular.module('game').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('game', {
        url: '/game/:roomName',
        templateUrl: 'modules/game/client/views/game.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('lobby', {
        url: '/lobby',
        templateUrl: 'modules/lobby/client/views/lobby.client.view.html',
        date: {
          roles: ['user', 'admin']
        }
      });
  }
]);
