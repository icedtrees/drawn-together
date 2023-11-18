'use strict';
import angular from '../../../../node_modules/angular'
import {coreModule} from "../core.client.module";

// Setting up route
angular.module(coreModule).config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    // Note: 'home' is routed to the game module!
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/client/core/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/client/core/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/client/core/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);