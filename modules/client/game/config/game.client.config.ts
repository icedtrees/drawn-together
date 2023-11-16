'use strict';
import angular from '../../../../node_modules/angular'
import {gameModule} from "../game.client.module";

// Configuring the Game module
angular.module(gameModule).run(['Menus',
  function (Menus) {}
]);

// Configure settings and constants
export const CanvasSettings = {
  MIN_DRAW_WIDTH: 3,
  MAX_DRAW_WIDTH: 30,

  DEFAULT_PEN_WIDTH: 3,
  DEFAULT_PEN_COLOUR: 'black',
  DEFAULT_ERASER_WIDTH: 30,

  MIN_DISPLAY_WIDTH: 200,
  RESOLUTION_WIDTH: 600,
  RESOLUTION_HEIGHT: 600
}

export const MouseConstants = {
  INVALID: 0,
  MOUSE_LEFT: 1,
  MOUSE_MIDDLE: 2,
  MOUSE_RIGHT: 3
};
