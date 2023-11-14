'use strict';

angular.module('game').directive('unselectable', function () {
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
