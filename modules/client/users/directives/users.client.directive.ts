'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";

// Users directive used to force lowercase input
angular.module(usersModule).directive('lowercase', function () {
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
