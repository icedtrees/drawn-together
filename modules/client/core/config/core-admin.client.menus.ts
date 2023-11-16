'use strict';
import angular from '../../../../node_modules/angular'
import {coreAdminModule} from "../core.client.module";
import {menuService} from "../services/menus.client.service";

angular.module(coreAdminModule).run([menuService,
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);
