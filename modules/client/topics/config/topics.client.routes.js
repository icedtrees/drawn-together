'use strict';
import angular from '../../../../node_modules/angular'

angular.module('topics').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('topics', {
        url: '/topics',
        templateUrl: 'modules/client/topics/views/topics.client.view.html'
      });
  }
]);
