'use strict';

var blacklist = ['and', 'or', 'so', 'as', 'if', 'the', 'a', 'an', 'at', 'by', 'in', 'of', 'on', 'to'];

(function(exports) {

  // Given a string, returns a set of words that aren't in the blacklist of articles/prepositions/conjunctions
  exports.importantWords = function(str, removePunctuation) {
    var words = str.split(/[ -]/);
    var wordList = [];

    for (var i = 0; i < words.length; i++ ) {
      // remove punctuation to prevent double counting of words like fire's and fire,s
      if (removePunctuation) {
        words[i] = words[i].replace(/[\W_]/g, '');
      }

      if ((words[i].length <= 3 && blacklist.indexOf(words[i]) !== -1) || // ignore if blacklisted
        wordList.indexOf(words[i]) !== -1) {                              // or already in word list
        continue;
      }
       wordList.push(words[i]);
    }

    return wordList;
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
(window.utils = window.utils || {})
: exports);
