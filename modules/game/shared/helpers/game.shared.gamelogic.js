'use strict';

(function(exports) {
  exports.Game = function(numRounds, numDrawers, timeToEnd) {
    this.currentRound = 0;
    this.numRounds = numRounds || 0;
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
    // At the end of the game, noone is a drawer
    if (this.currentRound >= this.numRounds) {
      return false;
    }

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

  /* Returns true if the game has ended and false otherwise */
  exports.Game.prototype.advanceRound = function () {
    this.curDrawer = (this.curDrawer + 1) % this.userList.length;
    for (var i = 0; i < this.userList.length; i++) {
      this.users[this.userList[i]].guessedCorrect = false;
    }
    this.correctGuesses = 0;

    this.currentRound++;
    if (this.currentRound >= this.numRounds) {
      return true;
    }
    return false;
  };

  exports.Game.prototype.getWinners = function () {
    var winners = [];
    var topScore = 0;
    var i;
    for (i = 0; i < this.userList.length; i++) {
      topScore = Math.max(topScore, this.users[this.userList[i]].score);
    }
    for (i = 0; i < this.userList.length; i++) {
      if (this.users[this.userList[i]].score === topScore) {
        winners.push(this.userList[i]);
      }
    }

    return winners;
  };

  exports.Game.prototype.restartGame = function () {
    this.currentRound = 0;
    this.correctGuesses = 0;
    for (var i = 0; i < this.userList.length; i++) {
      this.users[this.userList[i]].score = 0;
      this.users[this.userList[i]].guessedCorrect = false;
    }
  };

  exports.Game.prototype.getState = function () {
    var state = {
      currentRounds: this.currentRounds,
      numRounds: this.numRounds,
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
    this.currentRounds = state.currentRound;
    this.numRounds = state.numRounds;
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
