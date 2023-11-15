'use strict';
import angular from '../../../../node_modules/angular'
import * as GameSettings from '../../../shared/game/config/game.shared.game.config'

// Configure the 'game' module routes
angular.module('game').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('game', {
        url: '/game/{roomName:.{1,' + GameSettings.MAX_ROOM_NAME_LENGTH + '}}',
        templateUrl: 'modules/client/game/views/game.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
