'use strict';

(function(exports) {
    exports.topicListName = {
        settingName : "Topic",
        default: 'default',
        options: ['default', 'figma'] // hard-coded
    };
    exports.topicListDifficulty = {
        settingName : "Difficulty",
        default: 'random',
        options : ['easy', 'medium', 'hard', 'random']
    };
})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
    (window.topicSettings = window.topicSettings || {})
    : exports);
