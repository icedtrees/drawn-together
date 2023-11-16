'use strict';
import angular from '../../../../node_modules/angular'
import {topicsModule} from "../topics.client.module";
import {menuService} from "../../core/services/menus.client.service";

angular.module(topicsModule).run([menuService,
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Topics',
      state: 'topics',
      position: 2,
      roles: ['*']
    });
  }
]);
