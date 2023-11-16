'use strict';
import angular from '../../../../node_modules/angular'
import {coreAdminModule} from "../core.client.module";

angular.module(coreAdminModule).run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);
