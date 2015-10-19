'use strict';

// Configuring the Articles module
angular.module('lobby').run(['Menus',
  function (Menus) {}
]);

angular.module('game').constant('MouseConstants', {
  MAX_NUM_PLAYERS: 16
});
