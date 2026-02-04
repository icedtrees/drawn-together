'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectSocket = exports.useAddSocketListener = exports.currentSocket = void 0;
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
exports.currentSocket = {
    socket: null,
};
exports.useAddSocketListener = ((event, callback) => {
    // Store the latest callback in a ref, so we do not bind a stale callback to the current closure.
    const callbackRef = React.useRef();
    callbackRef.current = callback;
    const runEventCallback = (arg) => {
        // We need to force render React because sometimes two socket events come in without giving
        // React a chance to update the callback function. This ensures callback will be latest.
        ReactDOM.flushSync(() => {
            callbackRef.current(arg); // this works
        });
    };
    React.useEffect(() => {
        exports.currentSocket.socket.addEventListener(event, runEventCallback);
        return (() => exports.currentSocket.socket.removeEventListener(event, runEventCallback));
    }, []);
});
const connectSocket = (user) => {
    // Connect only when authenticated
    if (user && !exports.currentSocket.socket) {
        exports.currentSocket.socket = io();
    }
};
exports.connectSocket = connectSocket;
