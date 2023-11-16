'use strict';
import angular from '../../../../node_modules/angular'
import {usersAdminModule, usersModule} from "../users.client.module";

export const userAPIService = 'UsersAPI';
angular.module(usersModule).factory(userAPIService, ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);


export const adminAPIService = 'AdminAPI';
angular.module(usersAdminModule).factory(adminAPIService, ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
