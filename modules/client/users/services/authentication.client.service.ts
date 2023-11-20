'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";
import {setCurrentUser} from "../../core/app/reactapp";

// Authentication service for user variables
export const authenticationService = 'Authentication'
export const auth = {
  user: window.user,
}
angular.module(usersModule).factory(authenticationService, [
  function () {
    setCurrentUser(window.user)
    return auth;
  }
]);
