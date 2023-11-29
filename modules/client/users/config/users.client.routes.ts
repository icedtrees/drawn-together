'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";

// Setting up route
angular.module(usersModule).config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('authentication', {
        abstract: true,
        url: '/authentication',
      })
      .state('authentication.signin', {
        url: '/signin',
      });
  }
]);
