'use strict';
import * as React from 'react'
import * as ReactDOM from 'react-dom'

export const currentSocket = {
  socket: null,
}

const eventToCallback: {[event: string]: (arg: any) => void} = {}

export const useAddSocketListener = ((event: string, callback: (x: any) => void) => {
  // Store the latest callback in a ref, so we do not bind a stale callback to the current closure.
  const callbackRef = React.useRef()
  callbackRef.current = callback

  const runEventCallback = (arg) => {
    // We need to force render React because sometimes two socket events come in without giving
    // React a chance to update the callback function. This ensures callback will be latest.
    ReactDOM.flushSync(() => {
      callbackRef.current(arg)  // this works
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