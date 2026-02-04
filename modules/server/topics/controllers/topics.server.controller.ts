import {Request, Response} from "express";

const topicsData = require('../data/default-topics');

export const getTopics = async function (req: Request, res: Response) {
  res.json(topicsData.listTopics());
};

export const getWords = async function (req: Request, res: Response) {
  const topicName = req.params.topicName;
  const topic = topicsData.getTopic(topicName);
  if (topic != null) {
    res.json(topic);
  } else {
    res.status(404).send({
      message: 'Topic not found: ' + topicName
    });
  }
};

export const addTopic = async function (req: Request, res: Response) {
  res.status(501).send({
    message: 'Topic creation is disabled without a database.',
  });
};

export const updateWords = async function (req: Request, res: Response) {
  res.status(501).send({
    message: 'Topic updates are disabled without a database.',
  });
};
