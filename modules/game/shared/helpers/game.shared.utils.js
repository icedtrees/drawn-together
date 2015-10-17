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

  exports.Timer = function (serverTick) {
    this.timeLeft = 0; // timer that counts down
    this.paused = true;

    this.tick = function () {
      serverTick();
    };

    this.timer = setInterval(this.tick, 1000);

    this.setTimer = function (time) {
      clearInterval(this.timer);
      this.timer = setInterval(this.tick, 1000);
      this.timeLeft = time;
    };
  };

  exports.boldList = function (array) {
    return array.map(function (item) {
      return '<b>' + item + '</b>';
    });
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.utils = window.utils || {})
  : exports);
