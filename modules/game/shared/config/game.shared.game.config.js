'use strict';

(function(exports) {
    exports.numRounds = {
        settingName : "Number of rounds",
        default : 5,
        options : [5, 10, 15]
    };
    exports.roundTime = {
        settingName : "Round time",
        default: 90,
        options: [45, 60, 90, 120]
    };
    exports.timeToEnd = {
        settingName: "Time after first correct guess",
        default: 20,
        options: [10, 20, 30]
    };
    exports.topicListName = {
        settingName : "Topic list name",
        default: 'default',
        options: []
    };
    exports.difficulty = {
        settingName : "Difficulty",
        default: 'all',
        options : ['easy', 'medium', 'hard', 'all']
    };
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
    (window.gameSettings = window.gameSettings || {})
    : exports);
