'use strict';
import angular from '../../../../node_modules/angular'
import {rulesModule} from "../rules.client.module";
import {menuService} from "../../core/services/menus.client.service";

// Configuring the Rules module
angular.module(rulesModule).run([menuService,
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Rules',
      state: 'rules',
      position: 3,
      roles: ['*']
    });
  }
]);
