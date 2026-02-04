'use strict';

const topicsData = require('../data/default-topics');

exports.getWords = function (topicName, callback) {
  try {
    const words = topicsData.getWords(topicName);
    callback(null, words);
  } catch (err) {
    callback(err);
  }
};
