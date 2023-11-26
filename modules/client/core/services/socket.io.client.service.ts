'use strict';
import angular from '../../../../node_modules/angular'
import * as React from 'react'
import {coreModule} from "../core.client.module";
import {authenticationService} from "../../users/services/authentication.client.service";

export const currentSocket = {
  socket: null,
}

export const useAddSocketListener = ((event: string, callback: (x: any) => void, deps: any[]) => {
  React.useEffect(() => {
    currentSocket.socket.addEventListener(event, callback)
    return (() => currentSocket.socket.removeEventListener(callback))
  }, deps)
})

export const connectSocket = (user) => {
  // Connect only when authenticated
  if (user && !currentSocket.socket) {
    currentSocket.socket = io();
  }
}

// Create the Socket.io wrapper service
export const socketService = 'Socket'
angular.module(coreModule).service(socketService, [authenticationService, '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = () => {
      connectSocket(Authentication.user)
      this.socket = currentSocket.socket
    }
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
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
