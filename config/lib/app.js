'use strict';

/**
 * Module dependencies.
 */
var express = require('./express'),
  chalk = require('chalk');

var resolveEnv = function () {
  var env = process.env.NODE_ENV || 'development';
  if (env !== 'development' && env !== 'production') {
    env = 'development';
    process.env.NODE_ENV = env;
  }
  return env;
};

var env = resolveEnv();
var appTitle = env === 'development' ? 'Drawn Together - Development Environment' : 'Drawn Together';
var appConfig = {
  app: {
    title: appTitle
  },
  port: process.env.PORT || 3000
};

module.exports.init = function init(callback) {
  // Initialize express
  var app = express.init();
  if (callback) callback(app, appConfig);
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.init(function (app) {
    // Start the app by listening on <port>
    app.listen(appConfig.port, function () {

      // Logging initialization
      console.log('--');
      console.log(chalk.green(appTitle));
      console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
      console.log(chalk.green('Port:\t\t\t\t' + appConfig.port));
      if (process.env.NODE_ENV === 'secure') {
        console.log(chalk.green('HTTPs:\t\t\t\ton'));
      }
      console.log('--');

      if (callback) callback(app, appConfig);
    });

  });

};
