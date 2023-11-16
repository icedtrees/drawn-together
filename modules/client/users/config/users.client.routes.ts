'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";

// Setting up route
angular.module(usersModule).config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/client/users/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/client/users/views/settings/edit-profile.client.view.html'
      })
      .state('settings.change-password', {
        url: '/change-password',
        templateUrl: 'modules/client/users/views/settings/change-password.client.view.html'
      })
      .state('settings.remove-password', {
        url: '/remove-password',
        templateUrl: 'modules/client/users/views/settings/remove-password.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/client/users/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/client/users/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/client/users/views/authentication/signin.client.view.html'
      });
  }
]);
