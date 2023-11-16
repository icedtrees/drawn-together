'use strict';
import angular from '../../../../node_modules/angular'
import {topicsModule} from "../topics.client.module";

angular.module(topicsModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('topics', {
        url: '/topics',
        templateUrl: 'modules/client/topics/views/topics.client.view.html'
      });
  }
]);
