'use strict';
import angular from '../../../../node_modules/angular'
import {coreAdminRoutesModule} from "../core.client.module";

// Setting up route
angular.module(coreAdminRoutesModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);
