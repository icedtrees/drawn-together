'use strict';

// Configuring the Articles module
angular.module('lobby').run(['Menus',
  function (Menus) {
    // Add shortcut in menu to access lobby
    Menus.addMenuItem('topbar', {
      title: 'Lobby',
      state: 'lobby',
      position: 1
    });
  }
]);
