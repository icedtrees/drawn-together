'use strict';

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {}
]);

// Configure settings and constants
angular.module('game').constant('CanvasSettings', angular.extend({
  MIN_PEN_WIDTH: 1,
  DEFAULT_PEN_WIDTH: 1,
  MAX_PEN_WIDTH: 30,
  DEFAULT_PEN_COLOUR: '#000000',
  MIN_ERASER_WIDTH: 1,
  DEFAULT_ERASER_WIDTH: 30,
  MAX_ERASER_WIDTH: 100,
  RESOLUTION_WIDTH: 400,
  RESOLUTION_HEIGHT: 400
}, window.canvasSettings));

angular.module('game').constant('ChatSettings', angular.extend({
}, window.chatSettings));

angular.module('game').constant('GameSettings', angular.extend({
}, window.gameSettings));

angular.module('game').constant('MouseConstants', {
  INVALID: 0,
  MOUSE_LEFT: 1,
  MOUSE_MIDDLE: 2,
  MOUSE_RIGHT: 3
});

// Configure shared code
angular.module('game').factory('GameLogic', function () {
  return window.gameLogic;
});
