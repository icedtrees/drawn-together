'use strict';

// Configuring the Chat module
angular.module('chat').run(['Menus',
  function (Menus) {
  	// Removed so that Chat module is hidden in homepage
    // // Set top bar menu items
    // Menus.addMenuItem('topbar', {
    //   title: 'Chat',
    //   state: 'chat',
    //   position: 9999
    // });
  }
]);
