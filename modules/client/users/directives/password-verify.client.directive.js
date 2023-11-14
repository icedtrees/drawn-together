'use strict';

angular.module('users')
  .directive("passwordVerify", function() {
    return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, modelCtrl) {
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || modelCtrl.$viewValue) {
            combined = scope.passwordVerify + '_' + modelCtrl.$viewValue;
          }
          return combined;
        }, function(value) {
            modelCtrl.$parsers.unshift(function(viewValue) {
              var origin = scope.passwordVerify;
              if (origin === viewValue || (origin === '' && viewValue === '')) {
                modelCtrl.$setValidity("passwordVerify", true);
                return viewValue;
              } else {
                modelCtrl.$setValidity("passwordVerify", false);
                return undefined;
              }
            });
          }
        );
      }
    };
});
