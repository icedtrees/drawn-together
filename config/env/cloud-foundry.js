'use strict';

var cfenv = require('cfenv'),
  appEnv = cfenv.getAppEnv(),
  cfMongoUrl = appEnv.getService('mean-mongo') ?
  appEnv.getService('mean-mongo').credentials.uri : undefined;

var getCred = function (serviceName, credProp) {
  return appEnv.getService(serviceName) ?
    appEnv.getService(serviceName).credentials[credProp] : undefined;
};

module.exports = {
  port: appEnv.port,
  db: {
    uri: cfMongoUrl,
    options: {
      user: '',
      pass: ''
    }
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // By default we want logs to go to process.out so the Cloud Foundry Loggregator will collect them
    options: {}
  },
  facebook: {
    clientID: getCred('mean-facebook', 'id') || 'APP_ID',
    clientSecret: getCred('mean-facebook', 'secret') || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  }
};
