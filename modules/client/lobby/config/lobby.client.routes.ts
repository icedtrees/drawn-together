'use strict';
import angular from '../../../../node_modules/angular'
import {lobbyModule} from "../lobby.client.module";
import {ReactGlobalState} from "../../core/app/react-global-state";

// Configure the 'lobby' module routes
angular.module(lobbyModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        data: {
          roles: ['user', 'admin']
        },
        onEnter: () => ReactGlobalState.setCurrentPage('lobby'),
        onExit: () => ReactGlobalState.setCurrentPage(null),
      });
  }
]);
