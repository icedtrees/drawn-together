'use strict';

(function(exports) {
  exports.Game = function(initialState) {
    this.currentRound = 0;
    this.curDrawer = 0;
    this.userList = [];
    this.users = {};
    this.correctGuesses = 0;
    this.started = false;
    this.finished = false;
    if (initialState) {
      this.numRounds = initialState.numRounds;
      this.numDrawers = initialState.numDrawers;
      this.timeAfterGuess = initialState.timeAfterGuess;
      this.roundTime = initialState.roundTime;
    }
  };

  exports.Game.prototype.startGame = function () {
    this.resetGame();
    this.started = true;
  };

  exports.Game.prototype.getHost = function () {
    return this.userList[0];
  };

  exports.Game.prototype.getTopic = function () {
    return "random things";
  };

  exports.Game.prototype.addUser = function (username, profileImageURL) {
    this.userList.push(username);
    this.users[username] = {
      score: 0,
      guessedCorrect: false,
      profileImageURL: profileImageURL
    };
  };

  exports.Game.prototype.removeUser = function (username) {
    var idx = this.userList.indexOf(username);
    if (idx === -1) {
      return;
    }

    // The user to be removed is never going to be the current drawer - the round
    // is advanced before they are disconnected from the game
    if (idx === this.curDrawer && this.userList.length >= 2) {
      console.log('Trying to remove current drawer with 2+ players - this should never happen');
    }

    // If idx === 0, then curDrawer !== 0 (from the above)
    if (idx < this.curDrawer) {
      // Therefore curDrawer can always be decremented safely without going negative
      this.curDrawer--;
    }
    this.userList.splice(idx, 1);

    delete this.users[username];
  };

  exports.Game.prototype.getUserProfileImage = function (username) {
    return this.users[username].profileImageURL;
  };

  exports.Game.prototype.isDrawer = function (username) {
    // Before the game, no one is a drawer
    if (!this.started) {
      return false;
    }
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
    if (this.currentRound >= this.numRounds) {
      return [];
    }
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

    // Update scores
    // Drawers get NUM_GUESSERS points for the first guess, and 1 after that
    // Guessers get NUM_GUESSERS - NUM_CORRECT_GUESSES_THIS_ROUND
    // (With 3 guessers, first gets 3, second gets 2, last gets 1)
    this.users[username].score += this.userList.length - this.numDrawers - this.correctGuesses;
    var drawers = this.getDrawers();
    for (var i = 0; i < this.numDrawers; i++) {
      this.users[drawers[i]].score += this.correctGuesses === 0 ? this.userList.length - this.numDrawers : 1;
    }

    // update user information
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
      this.finished = true;
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

  exports.Game.prototype.resetGame = function () {
    this.currentRound = 0;
    this.correctGuesses = 0;
    this.started = false;
    this.finished = false;
    for (var i = 0; i < this.userList.length; i++) {
      this.users[this.userList[i]].score = 0;
      this.users[this.userList[i]].guessedCorrect = false;
    }
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.gameLogic = window.gameLogic || {})
  : exports);
