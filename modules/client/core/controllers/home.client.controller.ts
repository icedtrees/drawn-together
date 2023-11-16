'use strict';
import angular from '../../../../node_modules/angular'
import {authenticationService} from "../../users/services/authentication.client.service";
import {coreModule} from "../core.client.module";

export const homeController = 'HomeController'
angular.module(coreModule).controller(homeController, ['$scope', authenticationService,
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);
