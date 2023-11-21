'use strict';
import angular from '../../../../node_modules/angular'
import {topicsModule} from "../topics.client.module";
import {ReactGlobalState} from "../../core/app/react-global-state";

angular.module(topicsModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('topics', {
        url: '/topics',
        onEnter: () => {
          ReactGlobalState.setCurrentPage('topics')
        },
        onExit: () => {
          ReactGlobalState.setCurrentPage(null)
        },
      });
  }
]);
