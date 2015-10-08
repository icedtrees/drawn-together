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
    maxlength: [26, 'Username exceeds the maximum allowed length ({MAXLENGTH}).'],
    match: [/^[a-zA-Z0-9]{1,26}$/, 'Username may only contain letters and numbers.'],
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
    default: 'modules/users/client/img/profile/default.png'
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
  }

  if (this.uniqueIgnoreCase('username') === true) {
    this.invalidate('username', 'Username already exists.');
  }

  next();
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
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

// Method for determining if a field is unique, ignoring case
UserSchema.methods.uniqueIgnoreCase = function (field) {
  var self = this; // Prevents scoping issues.
  // Query database for user with username matching the regex '/^username$/i'.
  self.constructor.findOne({field : new RegExp('^' + self.field + '$', 'i')}, function (err, result) {
      if (!err && result && result !== self.field) {
        // There were no errors and there was another matching username, so we return true.
        return true;
      } else {
        return false;
      }
    }
  );
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
