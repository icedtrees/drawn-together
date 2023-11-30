import {prisma} from "../../prisma";
import {Request, Response} from "express";

const path = require('path'),
  logger = require(path.resolve('./config/lib/log'));

export const getTopics = async function (req: Request, res: Response) {
  const topics = await prisma.topics.findMany({
    select: {
      name: true,
    },
    orderBy: [
      { popularity: 'desc', },
      { name: 'asc', },
    ],
  });
  res.json(topics);
};

export const getWords = async function (req: Request, res: Response) {
  const topicName = req.params.topicName;
  const topic = await prisma.topics.findUnique({
    where: {
      name: topicName,
    }
  });
  if (topic != null) {
    res.json(topic);
  } else {
    res.status(404).send({
      message: 'Topic not found: ' + topicName
    });
  }
};

export const addTopic = async function (req: Request, res: Response) {
  try {
    const topic = await prisma.topics.create({
      data: {
        name: req.body.name,
        creator: req.user?.id ?? null,
        words: req.body.words,
        popularity: 0,
      },
    });

    logger.info('Successfully added new topic: %s', topic.name);
    return res.json(topic);
  } catch (e) {

    logger.error('Failed to save new topic %s', e);
    return res.status(400).send({
      message: e,
    });
  }
};

export const updateWords = async function (req: Request, res: Response) {
};
