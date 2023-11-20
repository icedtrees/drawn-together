'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";
import {ReactGlobalState} from "../../core/app/react-global-state";

// Authentication service for user variables
export const authenticationService = 'Authentication'
export const auth = {
  user: window.user,
}
angular.module(usersModule).factory(authenticationService, [
  function () {
    ReactGlobalState.setCurrentUser(window.user)
    return auth;
  }
]);
