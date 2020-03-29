'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  logger = require(path.resolve('./modules/core/server/log')),
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
  passport.authenticate('local', function (err, user, info) {
    if (!user) {
      user = new User(req.body);
      user.provider = 'local';
      user.save();
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
