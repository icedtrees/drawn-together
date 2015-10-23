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
    this.timeStarted = undefined;
    this.callback = undefined;
    this.delay = undefined;
    this.paused = true;
  };

  exports.Timer.prototype.restart = function (callback, delay) {
    this.pause();
    this.callback = callback || function () {};
    this.delay = delay;
    this.start();
  };

  exports.Timer.prototype.start = function () {
    if (this.paused) {
      this.timeStarted = Date.now();
      this.paused = false;

      var cb = function () {
        this.paused = true;
        this.delay = 0;

        this.callback();
      };

      this.id = setTimeout(cb.bind(this), this.delay);
    }
  };

  exports.Timer.prototype.pause = function () {
    if (!this.paused) {
      this.delay = this.timeLeft();
      this.paused = true;

      clearTimeout(this.id);
    }
  };

  exports.Timer.prototype.timeLeft = function() {
    if (this.paused) {
      return this.delay;
    }
    return Math.max(this.delay - (Date.now() - this.timeStarted), 0);
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.utils = window.utils || {})
  : exports);
