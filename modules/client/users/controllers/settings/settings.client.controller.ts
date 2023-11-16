'use strict';
import angular from '../../../../../node_modules/angular'
import {authenticationService} from "../../services/authentication.client.service";
import {usersModule} from "../../users.client.module";

export const settingsController = 'SettingsController'
angular.module(usersModule).controller(settingsController, ['$scope', authenticationService,
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);
