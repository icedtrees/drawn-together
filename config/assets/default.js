'use strict';

module.exports = {
  server: {
    models: 'modules/server/**/models/**/*.js',
    routes: ['modules/server/!(core)/routes/**/*.js', 'modules/server/core/routes/**/*.js'],
    sockets: 'modules/server/*/sockets/**/*.js',
    config: 'modules/server/*/config/*.js',
    policies: 'modules/server/*/policies/*.js',
  }
};
