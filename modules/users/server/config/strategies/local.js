'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function (username, password, done) {
      User.findOne({
        username : new RegExp('^' + username + '$', 'i')
      }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (user && user.authenticate && !user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        } else if (!user) {
          return done(null, false, {
            message: 'Invalid username'
          });
        }

        return done(null, user);
      });
    }
  ));
};
