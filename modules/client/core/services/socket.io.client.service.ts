'use strict';
import angular from '../../../../node_modules/angular'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {coreModule} from "../core.client.module";
import {authenticationService} from "../../users/services/authentication.client.service";

export const currentSocket = {
  socket: null,
}

const eventToCallback: {[event: string]: (arg: any) => void} = {}

export const useAddSocketListener = ((event: string, callback: (x: any) => void) => {
  eventToCallback[event] = callback

  const runEventCallback = (arg) => {
    // We need to force render React because callbacks might update React state, and we need subsequent callbacks to
    // read the latest React state (that may have been updated from previous callbacks or elsewhere).
    ReactDOM.flushSync(() => {
      eventToCallback[event](arg)  // this works
    })
  }
  React.useEffect(() => {
    currentSocket.socket.addEventListener(event, runEventCallback)
    return (() => currentSocket.socket.removeEventListener(event, runEventCallback))
  }, [])
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
