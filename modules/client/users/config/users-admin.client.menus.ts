'use strict';
import angular from '../../../../node_modules/angular'
import {menuService} from "../../core/services/menus.client.service";
import {usersAdminModule} from "../users.client.module";

// Configuring the Articles module
angular.module(usersAdminModule).run([menuService,
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin - Manage Users',
      state: 'admin.users',
      roles: ['admin']
    });
  }
]);
