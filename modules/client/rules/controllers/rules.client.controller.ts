'use strict';
import angular from '../../../../node_modules/angular'
import {authenticationService} from "../../users/services/authentication.client.service";
import {rulesModule} from "../rules.client.module";

// Create the 'rules' controller
export const rulesController = 'RulesController'
angular.module(rulesModule).controller(rulesController, ['$scope', '$http', authenticationService,
  function ($scope, $http, Authentication) {
  }
]);
