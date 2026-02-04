"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWords = exports.addTopic = exports.getWords = exports.getTopics = void 0;
const topicsData = require('../data/default-topics');
const getTopics = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json(topicsData.listTopics());
    });
};
exports.getTopics = getTopics;
const getWords = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const topicName = req.params.topicName;
        const topic = topicsData.getTopic(topicName);
        if (topic != null) {
            res.json(topic);
        }
        else {
            res.status(404).send({
                message: 'Topic not found: ' + topicName
            });
        }
    });
};
exports.getWords = getWords;
const addTopic = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(501).send({
            message: 'Topic creation is disabled without a database.',
        });
    });
};
exports.addTopic = addTopic;
const updateWords = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(501).send({
            message: 'Topic updates are disabled without a database.',
        });
    });
};
exports.updateWords = updateWords;
