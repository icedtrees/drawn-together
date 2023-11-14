'use strict';
import angular from '../../../../node_modules/angular'

// Configuring the Rules module
angular.module('rules').run(['Menus',
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
