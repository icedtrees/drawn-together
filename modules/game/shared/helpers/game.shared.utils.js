'use strict';

(function(exports) {
  exports.toCommaList = function (array) {
    var len = array.length;
    if (len === 1) {
      return array[0];
    } else {
      return array.slice(0, len - 1).join(', ') + ' and ' + array[len - 1];
    }
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.utils = window.utils || {})
  : exports);
