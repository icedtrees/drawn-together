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

  exports.toCommaListIs = function(array) {
    return exports.toCommaList(array) + (array.length === 1 ? ' is' : ' are');
  };

  exports.boldList = function (array) {
    return array.map(function (item) {
      return '<b>' + item + '</b>';
    });
  };

  exports.Timer = function () {
    this.timeLeft = 0;
    this.paused = true;
  };

  exports.Timer.tick = function(timer) {
    if (timer.paused) {
      return;
    }

    timer.timeLeft -= timer.timeLeft === 0 ? 0 : 1;
    return timer.timeLeft;
  };

  exports.notSorted = function(obj) {
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.utils = window.utils || {})
  : exports);
