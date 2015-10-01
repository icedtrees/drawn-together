'use strict';

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {}
]);

// Configure Game settings
angular.module('game').constant('GameSettings', angular.extend({
  MIN_PEN_WIDTH: 1,
  DEFAULT_PEN_WIDTH: 1,
  MAX_PEN_WIDTH: 30,
  DEFAULT_PEN_COLOUR: '#000000',
  MIN_ERASER_WIDTH: 1,
  DEFAULT_ERASER_WIDTH: 30,
  MAX_ERASER_WIDTH: 100
}, window.sharedSettings));

