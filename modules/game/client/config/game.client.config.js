'use strict';

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {}
]);

// Configure Game settings
angular.module('game').constant('GameSettings', {
  MAX_MESSAGES: 12,
  MIN_PEN_WIDTH: 1,
  DEFAULT_PEN_WIDTH: 1,
  MAX_PEN_WIDTH: 30,
  MIN_ERASER_WIDTH: 1,
  DEFAULT_ERASER_WIDTH: 30,
  MAX_ERASER_WIDTH: 100
});

