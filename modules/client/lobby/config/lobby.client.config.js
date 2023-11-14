'use strict';

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

angular.module('lobby').constant('PlayerConstants', {
  MAX_NUM_PLAYERS: 16
});
