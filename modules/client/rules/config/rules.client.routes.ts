'use strict';
import angular from '../../../../node_modules/angular'
import {rulesModule} from "../rules.client.module";

// Configure the 'rules' module routes
angular.module(rulesModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('rules', {
        url: '/rules',
        templateUrl: 'modules/client/rules/views/rules.client.view.html'
      });
  }
]);