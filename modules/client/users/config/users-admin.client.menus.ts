'use strict';
import angular from '../../../../node_modules/angular'
import {menuService} from "../../core/services/menus.client.service";
import {usersAdminModule} from "../users.client.module";

// Configuring the Articles module
angular.module(usersAdminModule).run([menuService,
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);
