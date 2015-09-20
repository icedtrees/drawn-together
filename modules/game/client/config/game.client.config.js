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
angular.module('game').service('GameSettings', function() {
  var MAX_MESSAGES = 12;

  return {
    getMaxMessages: function () {
      return MAX_MESSAGES;
    }
  };
});
