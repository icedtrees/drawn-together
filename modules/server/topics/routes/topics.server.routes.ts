import * as topics from "../controllers/topics.server.controller";
import {Express} from "express";

module.exports = function (app: Express) {
  app.route('/api/topics').get(topics.getTopics);
  app.route('/api/topics/:topicName').get(topics.getWords);

  app.route('/api/topics').post(topics.addTopic);
  app.route('/api/topics/:topicName').post(topics.updateWords);
};
