'use strict';

var blacklist = ['and', 'or', 'so', 'as', 'if', 'the', 'a', 'an', 'at', 'by', 'in', 'of', 'on', 'to'];

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

  // Given a string, returns a set of words that aren't in the blacklist of articles/prepositions/conjunctions
  exports.importantWords = function(str, removePunctuation) {
    var words = str.split(/[ -]/);
    var wordList = [];

    for (var i = 0; i < words.length; i++ ) {
      if (removePunctuation) {
        words[i] = words[i].replace(/[\W_]/g, '');
      }

      if ((words[i].length <= 3 && blacklist.indexOf(words[i]) !== -1) || // ignore if blacklisted
      wordList.indexOf(words[i]) !== -1) {                                // or already in word list
        continue;
      }

      wordList.push(words[i]);
    }

    return wordList;
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.utils = window.utils || {})
  : exports);
