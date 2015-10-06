'use strict';

(function(exports) {
  exports.MAX_MESSAGES = 12;
  exports.MAX_MSG_LEN = 65;
  exports.SERVER_NAME = 'server';
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.chatSettings = window.chatSettings || {})
  : exports);
