'use strict';

var topics = require('../controllers/topics.server.controller');

module.exports = function (app) {
  app.route('/api/topics').get(topics.getTopics);
  app.route('/api/topics/:topicName').get(topics.getWords);

  app.route('/api/topics').post(topics.addTopic);
  app.route('/api/topics/:topicName').post(topics.updateWords);
};
