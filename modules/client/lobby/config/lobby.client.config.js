'use strict';
import angular from '../../../../node_modules/angular'

// Configuring the Articles module
angular.module('lobby').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Lobby',
      state: 'home',
      position: 1,
      roles: ['*']
    });
  }
]);
