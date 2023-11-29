'use strict';
import angular from '../../../../node_modules/angular'

import {coreModule} from "../core.client.module";
const defaultRoles = ['user', 'admin'];
export const menus = {};

export const shouldRender = function (menuItem, user) {
  if (!!~menuItem.roles.indexOf('*')) {
    return true;
  } else {
    if(!user) {
      return false;
    }
    for (var userRoleIndex in user.roles) {
      for (var roleIndex in menuItem.roles) {
        if (menuItem.roles[roleIndex] === user.roles[userRoleIndex]) {
          return true;
        }
      }
    }
  }

  return false;
};

const validateMenuExistance = function (menuId) {
  if (menuId && menuId.length) {
    if (menus[menuId]) {
      return true;
    } else {
      throw new Error('Menu does not exist');
    }
  } else {
    throw new Error('MenuId was not provided');
  }

  return false;
};

export const fetchMenu = function (menuId) {
  // Validate that the menu exists
  validateMenuExistance(menuId);

  // Return the menu object
  return menus[menuId];
};

const addMenu = function (menuId, options) {
  options = options || {};

  // Create the new menu
  menus[menuId] = {
    roles: options.roles || defaultRoles,
    items: options.items || [],
    shouldRender: shouldRender
  };

  // Return the menu object
  return menus[menuId];
};

//Adding the topbar menu
addMenu('topbar', {
  roles: ['*']
});

const addMenuItem = function (menuId, options) {
  options = options || {};

  // Validate that the menu exists
  validateMenuExistance(menuId);

  // Push new menu item
  menus[menuId].items.push({
    title: options.title || '',
    state: options.state || '',
    type: options.type || 'item',
    class: options.class,
    roles: ((options.roles === null || typeof options.roles === 'undefined') ? defaultRoles : options.roles),
    position: options.position || 0,
    items: [],
    shouldRender: shouldRender
  });

  // Return the menu object
  return menus[menuId];
};

addMenuItem('topbar', {
  title: 'Lobby',
  state: 'home',
  position: 1,
  roles: ['*']
});
addMenuItem('topbar', {
  title: 'Rules',
  state: 'rules',
  position: 3,
  roles: ['*']
});
// Topics page is not implemented yet
// addMenuItem('topbar', {
//   title: 'Topics',
//   state: 'topics',
//   position: 2,
//   roles: ['*']
// });
