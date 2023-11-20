'use strict';
import angular from '../../../../node_modules/angular'
import {coreModule} from "../core.client.module";
import {ReactGlobalState} from "../app/react-global-state";

// Setting up route
angular.module(coreModule).config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      ReactGlobalState.setCurrentPage('not-found')
    });
  }
]);
