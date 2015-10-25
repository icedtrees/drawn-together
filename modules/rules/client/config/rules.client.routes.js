'use strict';

// Configure the 'rules' module routes
angular.module('rules').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('rules', {
        url: '/rules',
        templateUrl: 'modules/rules/client/views/rules.client.view.html'
      });
  }
]);
