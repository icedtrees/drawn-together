'use strict';
import angular from '../../../../node_modules/angular'
import {topicsModule} from "../topics.client.module";
import {authenticationService} from "../../users/services/authentication.client.service";

export const topicsController = 'TopicsController'
angular.module(topicsModule).controller(topicsController, ['$scope', '$http', authenticationService,
  function ($scope, $http, Authentication) {
  }
]);
