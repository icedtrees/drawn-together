'use strict';
import angular from '../../../../node_modules/angular'
import {lobbyModule} from "../lobby.client.module";
import {menuService} from "../../core/services/menus.client.service";

// Configuring the Articles module
angular.module(lobbyModule).run([menuService,
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Lobby',
      state: 'home',
      position: 1,
      roles: ['*']
    });
  }
]);
