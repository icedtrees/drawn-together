'use strict';
import angular from '../../../../node_modules/angular'

import {coreModule} from "../core.client.module";
import {authenticationService} from "../../users/services/authentication.client.service";
import {menuService} from "../services/menus.client.service";

export const headerController = 'HeaderController'
angular.module(coreModule).controller(headerController, ['$scope', '$state', authenticationService, menuService,
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);
