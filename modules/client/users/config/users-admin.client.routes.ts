'use strict';
import angular from '../../../../node_modules/angular'
import {usersAdminRoutesModule} from "../users.client.module";
import {adminAPIService} from "../services/users.client.service"
import {userAdminController} from "../controllers/admin/user.client.controller";
import {userListAdminController} from "../controllers/admin/list-users.client.controller";

// Setting up route
angular.module(usersAdminRoutesModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/client/users/views/admin/list-users.client.view.html',
        controller: userListAdminController,
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/client/users/views/admin/view-user.client.view.html',
        controller: userAdminController,
        resolve: {
          userResolve: ['$stateParams', adminAPIService, function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/client/users/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);
