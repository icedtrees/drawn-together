'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator');

var TopicSchema = new Schema({
  name: {
    type: String,
    unique: 'Topic name already exists',
    required: 'Topic must have a name',
    minlength: [1, 'Topic name must contain at least one character'],
    maxlength: [20, 'Topic name exceeds the maximum allowed length ({MAXLENGTH}).'],
    trim: true // Removes surrounding whitespace
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
  words: {
    type: [String],
    required: true
  },
  popularity: {
    type: Number,
    default: 0
  }
});

/**
 * Hook a pre validate method to validate the password
 */
TopicSchema.pre('validate', function (next) {
  if (this.words.length < 1 || this.words.length > 1000) {
    this.invalidate('words', 'Topic must have at least one word and at most 1000 words');
    next();
  }
  next();
});

mongoose.model('Topic', TopicSchema);
