'use strict';

// Configuring the Game module
angular.module('game').run(['Menus',
  function (Menus) {}
]);

// Configure settings and constants
angular.module('game').constant('CanvasSettings', angular.extend({
  MIN_DRAW_WIDTH: 1,
  MAX_DRAW_WIDTH: 30,

  DEFAULT_PEN_WIDTH: 3,
  DEFAULT_PEN_COLOUR: '#000000',
  DEFAULT_ERASER_WIDTH: 30,

  RESOLUTION_WIDTH: 400,
  RESOLUTION_HEIGHT: 400
}, window.canvasSettings));

angular.module('game').constant('ChatSettings', angular.extend({
}, window.chatSettings));

angular.module('game').constant('GameSettings', angular.extend({
  numRounds : {
    settingName : "Number of rounds",
    default : 5,
    options : [5, 10, 15]
  },
  roundTime : {
    settingName : "Round time",
    default: 90,
    options: [45, 60, 90, 120]
  },
  timeToEnd : {
    settingName: "Time after first correct guess",
    default: 20,
    options: [10, 20, 30]
  }
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

angular.module('game').factory('Utils', function () {
  return window.utils;
});
