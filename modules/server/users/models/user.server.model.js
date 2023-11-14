'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator');

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
  return ((email === '') || validator.isEmail(email));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  username: {
    type: String,
    unique: 'Username already exists',
    required: 'Please fill in a username',
    minlength: [1, 'Username must contain at least one character.'],
    maxlength: [24, 'Username exceeds the maximum allowed length ({MAXLENGTH}).'],
    trim: true // Removes surrounding whitespace
  },
  password: {
    type: String,
    default: '',
    maxlength: [128, 'Password exceeds the maximum allowed length ({MAXLENGTH}).']
  },
  salt: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    default: undefined,
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  profileImageURL: {
    type: String,
    default: 'modules/client/users/img/profile/default.png'
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {}, // Gives us the flexibility to easily add social integration later on.
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

/**
 * Hook a pre validate method to validate the password
 */
UserSchema.pre('validate', function (next) {
  if (this.password && this.password.length > 128) {
    this.invalidate('password', 'Password exceeds the maximum allowed length (128).');
    next();
  } else {
    var self = this;
    // Query database for user with username matching the regex '/^myUsername$/i'.
    this.constructor.findOne({username : new RegExp('^' + this.username + '$', 'i')}, function (err, result){
      if(err) {
        next(err);
      } else if (result && result.username !== self.username) {
        self.invalidate('username', 'Username must be unique');
        next();
      } else {
        next();
      }
    });
  }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
    next();
  } else {
    var self = this;
    // Query database for user with username matching the regex '/^myUsername$/i'.
    this.constructor.findOne({username : new RegExp('^' + this.username + '$', 'i')}, function (err, result){
      if(err) {
        next(err);
      } else if (result && result.username !== self.username) {
        self.invalidate('username', 'Username must be unique');
        next();
      } else {
        next();
      }
    });
  }
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'sha1').toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  if (password) {
    return this.password === this.hashPassword(password);
  } else {
    return this.password === '';
  }
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
  var _this = this;
  var possibleUsername = username.toLowerCase() + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function (err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

mongoose.model('User', UserSchema);
