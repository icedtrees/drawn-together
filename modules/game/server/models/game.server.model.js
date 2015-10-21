'use strict';

/**
 * TODO: not sure if needed
 * Modeled after modules/user/server/models/user.server.model.js
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/** topicList schema */
var TopicListSchema = new Schema({
   name: {
       type: String,
       unique: 'Topic list name already exists',
       required: 'Please fill in a topic list name',
       trim: true
   },
    //comments: [{ body: String, date: Date }],
    words: [{
        word: String,
        difficulty: String, //easy, medium, hard
    }]

});



TopicListSchema.methods.getTopicList = function(name) {

};

var TopicList = mongoose.model('TopicList', TopicListSchema);

// Make this(?) available to Node applications
module.exports = TopicList;
