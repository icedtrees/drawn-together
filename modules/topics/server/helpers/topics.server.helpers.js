'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  Topic = mongoose.model('Topic'),
  logger = require(path.resolve('./config/lib/log'));

exports.getWords = function (topicName, callback) {
  Topic.findOne({name: topicName}, function (err, topic) {
    if (err) {
      callback(err);
    } else {
      if (topic) {
        callback(null, topic.words);
      } else {
        callback(null, null);
      }
    }
  });
};
