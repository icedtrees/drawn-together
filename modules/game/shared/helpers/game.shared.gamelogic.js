'use strict';

(function(exports) {
  exports.Game = function(numDrawers) {
    this.numDrawers = numDrawers || 0;
    this.curDrawer = 0;
    this.userList = [];
    this.users = {};
  };

  exports.Game.prototype.addUser = function (username) {
    this.userList.push(username);
    this.users[username] = {
      score: 0
    };
  };

  exports.Game.prototype.removeUser = function (username) {
    var idx = this.userList.indexOf(username);
    if (idx !== -1) {
      this.userList.splice(idx);
    }
  };

  exports.Game.prototype.isDrawer = function (username) {
    for (var i = 0; i < this.userList.length && i < this.numDrawers; i++) {
      var idx = (this.curDrawer + i) % this.userList.length;
      if (this.userList[idx] === username) {
        return true;
      }
    }
    return false;
  };

  exports.Game.prototype.getDrawers = function () {
    var drawers = [];
    for (var i = 0; i < this.userList.length && i < this.numDrawers; i++) {
      var idx = (this.curDrawer + i) % this.userList.length;
      drawers.push(this.userList[idx]);
    }

    return drawers;
  };

  exports.Game.prototype.advanceRound = function () {
    this.curDrawer = (this.curDrawer + 1) % this.userList.length;
  };

  exports.Game.prototype.getState = function () {
    var state = {
      numDrawers: this.numDrawers,
      curDrawer: this.curDrawer,
      userList: this.userList,
      users: this.users
    };

    return state;
  };

  exports.Game.prototype.setState = function (state) {
    this.numDrawers = state.numDrawers;
    this.curDrawer = state.curDrawer;
    this.userList = state.userList;
    this.users = state.users;
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.gameLogic = window.gameLogic || {})
  : exports);
