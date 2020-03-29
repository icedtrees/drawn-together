'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  Topic = mongoose.model('Topic'),
  logger = require(path.resolve('./config/lib/log'));

exports.getTopics = function (req, res) {
  Topic.find({}).sort([['popularity', -1], ['name', 1]]).exec(function (err, topics) {
    if (err) {
      logger.warn('Failed to fetch topics', err);
      res.status(500).send({
        message: err
      });
    } else {
      res.json(topics.map(function (topic) {
        return {
          name: topic.name,
          creator: topic.creator
        };
      }));
    }
  });
};

exports.getWords = function (req, res) {
  var topicName = req.params.topicName;
  Topic.findOne({name: topicName}, function (err, topic) {
    if (err) {
      logger.warn('Failed to find words for topic %s', topicName);
      res.status(500).send({
        message: err
      });
    } else {
      if (topic) {
        res.json(topic);
      } else {
        res.status(404).send({
          message: 'Topic not found: ' + topicName
        });
      }
    }
  });
};

exports.addTopic = function (req, res) {

  var topic = new Topic({
    name: req.body.name,
    creator: req.user,
    words: req.body.words
  });

  // Then save the user via mongoose
  topic.save(function (err) {
    if (err) {
      logger.error('Failed to save new topic %s', err);
      return res.status(400).send({
        message: err
      });
    } else {
      logger.info('Successfully added new topic: %s', topic.name);
      return res.json(topic);
    }
  });
};

exports.updateWords = function (req, res) {
};
