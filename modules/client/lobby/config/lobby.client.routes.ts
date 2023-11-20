'use strict';
import angular from '../../../../node_modules/angular'
import {lobbyModule} from "../lobby.client.module";
import {setCurrentPage} from "../../core/app/reactapp";

// Configure the 'lobby' module routes
angular.module(lobbyModule).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        data: {
          roles: ['user', 'admin']
        },
        onEnter: () => setCurrentPage('lobby'),
        onExit: () => setCurrentPage(null),
      });
  }
]);
