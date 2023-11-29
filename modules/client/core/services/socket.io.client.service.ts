'use strict';
import * as React from 'react'
import * as ReactDOM from 'react-dom'

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