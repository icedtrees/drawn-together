'use strict';

(function(exports) {
  exports.Game = function(numDrawers, timeToEnd) {
    this.numDrawers = numDrawers || 0;
    this.curDrawer = 0;
    this.userList = [];
    this.users = {};
    this.timeToEnd = timeToEnd || 0;
    this.correctGuesses = 0;
  };

  exports.Game.prototype.addUser = function (username) {
    this.userList.push(username);
    this.users[username] = {
      score: 0,
      guessedCorrect: false
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

  exports.Game.prototype.userHasGuessed = function(username) {
    return this.users[username].guessedCorrect;
  };

  exports.Game.prototype.markCorrectGuess = function(username) {
    // Only allow correct guesses once per round
    if (this.userHasGuessed(username)) {
      return;
    }

    // First to guess gets numGuessers pts. Last person to guess gets 1 pt. Decrease reward by 1 each time.
    //this.users[username].score += (this.users.length - this.numDrawers - this.correctGuesses);

    this.users[username].guessedCorrect = true;
    this.correctGuesses++;
  };

  exports.Game.prototype.allGuessed = function() {
    return this.correctGuesses === this.userList.length - this.numDrawers;
  };

  exports.Game.prototype.advanceRound = function () {
    this.curDrawer = (this.curDrawer + 1) % this.userList.length;
    for (var i = 0; i < this.userList.length; i++) {
      this.users[this.userList[i]].guessedCorrect = false;
    }
    this.correctGuesses = 0;
  };

  exports.Game.prototype.getState = function () {
    var state = {
      numDrawers: this.numDrawers,
      curDrawer: this.curDrawer,
      userList: this.userList,
      users: this.users,
      timeToEnd: this.timeToEnd,
      correctGuesses: this.correctGuesses
    };

    return state;
  };

  exports.Game.prototype.setState = function (state) {
    this.numDrawers = state.numDrawers;
    this.curDrawer = state.curDrawer;
    this.userList = state.userList;
    this.users = state.users;
    this.timeToEnd = state.timeToEnd;
    this.correctGuesses = state.correctGuesses;
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.gameLogic = window.gameLogic || {})
  : exports);
