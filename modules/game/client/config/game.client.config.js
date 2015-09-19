'use strict';

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Game',
      state: 'game',
      position: 0
    });
  }
]);
