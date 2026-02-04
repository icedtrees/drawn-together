'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  express = require('./express'),
  chalk = require('chalk');

module.exports.init = function init(callback) {
  // Initialize express
  var app = express.init();
  if (callback) callback(app, config);
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.init(function (app, config) {
    // Start the app by listening on <port>
    app.listen(config.port, function () {

      // Logging initialization
      console.log('--');
      console.log(chalk.green(config.app.title));
      console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
      console.log(chalk.green('Port:\t\t\t\t' + config.port));
      if (process.env.NODE_ENV === 'secure') {
        console.log(chalk.green('HTTPs:\t\t\t\ton'));
      }
      console.log('--');

      if (callback) callback(app, config);
    });

  });

};
