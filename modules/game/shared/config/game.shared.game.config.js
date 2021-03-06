'use strict';

(function(exports) {
    exports.TIME_BETWEEN_GAMES = 30;
    exports.MAX_TOPIC_LENGTH = 23;
    exports.MAX_NUM_PLAYERS = 16;
    exports.MAX_ROOM_NAME_LENGTH = 24;

    exports.numRounds = {
        settingName : "Rounds",
        default : 10,
        options : [5, 10, 20]
    };
    exports.roundTime = {
        settingName : "Draw time",
        default: 90,
        options: [45, 60, 90, 120]
    };
    exports.timeAfterGuess = {
        settingName: "Reserve time",
        default: 20,
        options: [10, 20, 30]
    };
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
    (window.gameSettings = window.gameSettings || {})
    : exports);
