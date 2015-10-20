'use strict';

// Configuring the Articles module
angular.module('lobby').run(['Menus',
  function (Menus) {}
]);

angular.module('lobby').constant('PlayerConstants', {
  MAX_NUM_PLAYERS: 16
});
