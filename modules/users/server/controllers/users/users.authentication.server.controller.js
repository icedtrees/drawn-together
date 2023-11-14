'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  logger = require(path.resolve('./config/lib/log')),
  User = mongoose.model('User');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', async function (err, user, info) {
    if (!user) {
      user = new User(req.body);
      user.provider = 'local';
      try {
        await user.save();
      } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
          res.status(400).send(e);
          return;
        } else {
          logger.warn('Failed to create new user %s: %s', req.body.username, e.toString());
          res.status(500).send(e);
          return;
        }
      }
    }
    // Remove sensitive data before login
    user.password = undefined;
    user.salt = undefined;

    req.login(user, function (err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.json(user);
      }
    });
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};
