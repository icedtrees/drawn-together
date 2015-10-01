'use strict';

(function(exports) {
    exports.NUM_DRAWERS = 1;
    exports.TIME_TO_END = 20;
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
    (window.chatSettings = window.chatSettings || {})
    : exports);
