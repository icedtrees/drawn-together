'use strict';

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {}
]);

// Configure Game settings
angular.module('game').constant('GameSettings', {
  MAX_MESSAGES: 12
});
