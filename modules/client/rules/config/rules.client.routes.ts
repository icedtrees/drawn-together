'use strict';
import angular from '../../../../node_modules/angular'
import {rulesModule} from "../rules.client.module";
import {ReactGlobalState} from "../../core/app/react-global-state";

// Configure the 'rules' module routes
angular.module(rulesModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('rules', {
        url: '/rules',
        onEnter: () => ReactGlobalState.setCurrentPage('rules'),
        onExit: () => ReactGlobalState.setCurrentPage(null),
      });
  }
]);
