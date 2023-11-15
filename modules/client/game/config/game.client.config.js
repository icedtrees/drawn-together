'use strict';
import angular from '../../../../node_modules/angular'

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {}
]);

// Configure settings and constants
angular.module('game').constant('CanvasSettings', angular.extend({
  MIN_DRAW_WIDTH: 3,
  MAX_DRAW_WIDTH: 30,

  DEFAULT_PEN_WIDTH: 3,
  DEFAULT_PEN_COLOUR: 'black',
  DEFAULT_ERASER_WIDTH: 30,

  MIN_DISPLAY_WIDTH: 200,
  RESOLUTION_WIDTH: 600,
  RESOLUTION_HEIGHT: 600
}, window.canvasSettings));

angular.module('game').constant('MouseConstants', {
  INVALID: 0,
  MOUSE_LEFT: 1,
  MOUSE_MIDDLE: 2,
  MOUSE_RIGHT: 3
});
