'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";

// Authentication service for user variables
export const authenticationService = 'Authentication'
angular.module(usersModule).factory(authenticationService, ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);
