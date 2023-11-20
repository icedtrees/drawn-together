'use strict';
import angular from '../../../../node_modules/angular'
import {coreModule} from "../core.client.module";
import {authenticationService} from "../../users/services/authentication.client.service";

export const currentSocket = {
  socket: null,
}

// Create the Socket.io wrapper service
export const socketService = 'Socket'
angular.module(coreModule).service(socketService, [authenticationService, '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        currentSocket.socket = io();
        this.socket = currentSocket.socket
        console.log('creating socket')
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (currentSocket.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);
