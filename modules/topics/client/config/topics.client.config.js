'use strict';

angular.module('topics').run(['Menus',
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
