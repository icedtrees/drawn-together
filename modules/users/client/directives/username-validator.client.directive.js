'use strict';

angular.module('users').directive('usernameValidator', function() {
    return {
        require: 'ngModel',
        // scope = the parent scope
        // elem = the element the directive is on
        // attr = a dictionary of attributes on the element
        // ctrl = the controller for ngModel.
        link: function(scope, elem, attr, ctrl) {

            // add a parser into the model that runs when the user updates it.
            ctrl.$parsers.unshift(function (username) {
                var isValid = /^[a-z0-9]{1,26}$/.test(username);
                ctrl.$setValidity('chosenUsername', isValid);

                // if it's valid, return the value to the model, otherwise return undefined.
                if (isValid) {
                    return username;
                } else {
                    var errors = [];
                    if (username.length < 1) {
                        errors.push("Username must be at least one character long.");
                    }
                    if (username.length > 26) {
                        errors.push("Username must be at most 26 characters long.");
                    }
                    if (/[^a-z0-9]/.test(username)) {
                        errors.push("Username must only contain letters and numbers.");
                    }
                    scope.usernameErrors = errors;
                    return undefined;
                }
            });
        }
    };
});
