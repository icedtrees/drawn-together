'use strict';

angular.module('users').directive('usernameValidator', ['settings', function(settings) {
    return {
        require: 'ngModel',
        // scope = the parent scope
        // elem = the element the directive is on
        // attr = a dictionary of attributes on the element
        // ctrl = the controller for ngModel.
        link: function(scope, elem, attr, ctrl) {

            // Add a parser into the model that runs when the user updates it.
            ctrl.$parsers.unshift(function (username) {
                var isValid = new RegExp(
                    '^[' + settings.validChars + ']{' + settings.minLength + ',' + settings.maxLength + '}$').test(username);
                ctrl.$setValidity('chosenUsername', isValid);

                // If it's valid, return the value to the model, otherwise return undefined.
                if (isValid) {
                    return username;
                } else {
                    var errors = [];
                    if (username.length < settings.minLength) {
                        errors.push("Username must be at least " + settings.minLength + " character" +
                            (settings.minLength === 1 ? "s" : "") + " long.");
                    }
                    if (username.length > settings.maxLength) {
                        errors.push("Username must be at most " + settings.maxLength + " characters long.");
                    }
                    if (new RegExp('[^' + settings.validChars + ']').test(username)) {
                        errors.push("Username must only contain letters and numbers.");
                    }
                    scope.usernameErrors = errors;
                    return undefined;
                }
            });
        }
    };
}]);
