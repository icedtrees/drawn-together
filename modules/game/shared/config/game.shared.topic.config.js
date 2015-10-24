'use strict';

(function(exports) {
    exports.topicListName = {
        settingName : "Topic",
        default: 'default',
        options: [] //set in game/server/sockets/game.server.socket.config.js
    };
    exports.topicListDifficulty = {
        settingName : "Difficulty",
        default: 'all',
        options : ['easy', 'medium', 'hard', 'all']
    };
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
    (window.topicSettings = window.topicSettings || {})
    : exports);
