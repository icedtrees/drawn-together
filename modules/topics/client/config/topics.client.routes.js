'use strict';

angular.module('topics').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('topics', {
        url: '/topics',
        templateUrl: 'modules/topics/client/views/topics.client.view.html'
      });
  }
]);
