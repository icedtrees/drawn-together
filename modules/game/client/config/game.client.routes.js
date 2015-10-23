'use strict';

// Configure the 'game' module routes
angular.module('game').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/game/client/views/game.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
