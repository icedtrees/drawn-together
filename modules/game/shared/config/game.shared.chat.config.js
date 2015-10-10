'use strict';

(function(exports) {
  exports.MAX_MESSAGES = 63;
  exports.MAX_MSG_LEN = 65;
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.chatSettings = window.chatSettings || {})
  : exports);
