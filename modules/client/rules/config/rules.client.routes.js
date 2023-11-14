'use strict';
import angular from '../../../../node_modules/angular'

// Configure the 'rules' module routes
angular.module('rules').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('rules', {
        url: '/rules',
        templateUrl: 'modules/client/rules/views/rules.client.view.html'
      });
  }
]);
