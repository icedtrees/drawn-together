'use strict';

(function(exports) {
  exports.MAX_MESSAGES = 12;
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.chatSettings = window.chatSettings || {})
  : exports);