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

// Configure Game settings
angular.module('game').constant('GameSettings', {
  MAX_MESSAGES: 12
});
