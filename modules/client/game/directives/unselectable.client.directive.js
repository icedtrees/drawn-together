'use strict';
import angular from '../../../../node_modules/angular'
import {gameModule} from "../game.client.module";

export const unselectableDirective = 'unselectable'
angular.module(gameModule).directive(unselectableDirective, function () {
    return {
      restrict: 'C',
      link: function (scope, element) {
        element.bind('mousedown', function (e) {
          // Prevent cursor from turning into text cursor in Chrome
          e.preventDefault();
        });
      }
    };
  }
);
