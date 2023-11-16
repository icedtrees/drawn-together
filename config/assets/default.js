'use strict';

module.exports = {
  client: {
    css: [
      'public/modules/client/core/css/*.css', // core css must come before other modules
      'public/modules/client/**/*.css',
      'modules/client/*/css/*.css'
    ],
    js: [
      'modules/client/core/app/init.ts',
      'modules/client/*/*.js',
      'modules/client/**/*.js',
    ],
  },
  server: {
    models: 'modules/server/**/models/**/*.js',
    routes: ['modules/server/!(core)/routes/**/*.js', 'modules/server/core/routes/**/*.js'],
    sockets: 'modules/server/*/sockets/**/*.js',
    config: 'modules/server/*/config/*.js',
    policies: 'modules/server/*/policies/*.js',
  }
};
