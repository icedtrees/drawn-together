'use strict';
import angular from '../../../../node_modules/angular'
import {topicsModule} from "../topics.client.module";
import {setCurrentPage} from "../../core/app/reactapp";

angular.module(topicsModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('topics', {
        url: '/topics',
        onEnter: () => {
          setCurrentPage('topics')
        },
        onExit: () => {
          setCurrentPage(null)
        },
      });
  }
]);
