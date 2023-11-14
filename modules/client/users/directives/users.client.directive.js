'use strict';
import angular from '../../../../node_modules/angular'

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
        var lowercase_function = function (input) {
            return input ? input.toLowerCase() : '';
        };
        modelCtrl.$parsers.push(lowercase_function);
    }
  };
});
