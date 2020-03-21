'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  mongooseConfig = require('./mongoose-config'),
  express = require('./express'),
  logger = require('./log'),
  chalk = require('chalk'),
  mongoose = require('mongoose');

module.exports.loadModels = function loadModels() {
  mongooseConfig.loadModels();
};

module.exports.init = function init(callback) {
  mongooseConfig.connect(function (db) {
    // Initialize express
    var app = express.init(db);
    if (callback) callback(app, db, config);

  });
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.loadModels();
  _this.init(function (app, db, config) {

    //Seed DB with initial values
    if (config.seedDB) {
      require('./seed');
    }

    // Start the app by listening on <port>
    app.listen(config.port, function () {

      // Logging initialization
      console.log('--');
      console.log(chalk.green(config.app.title));
      console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
      console.log(chalk.green('Port:\t\t\t\t' + config.port));
      console.log(chalk.green('Database:\t\t\t\t' + config.db.uri));
      if (process.env.NODE_ENV === 'secure') {
        console.log(chalk.green('HTTPs:\t\t\t\ton'));
      }
      console.log(chalk.green('App version:\t\t\t' + config.meanjs.version));
      if (config.meanjs['meanjs-version'])
        console.log(chalk.green('MEAN.JS version:\t\t\t' + config.meanjs['meanjs-version']));
      console.log('--');

      if (callback) callback(app, db, config);
    });

  });

};
