'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/font-awesome/css/font-awesome.css'
      ],
      js: [
        'public/lib/angular/angular.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
      ]
    },
    css: [
      'public/modules/client/core/css/*.css', // core css must come before other modules
      'public/modules/client/**/*.css',
      'modules/client/*/css/*.css'
    ],
    js: [
      'modules/client/core/app/config.js',
      'modules/client/core/app/init.js',
      'modules/shared/*/*.js',
      'modules/shared/*/**/*.js',
      'modules/client/*/*.js',
      'modules/client/*/**/*.js'
    ],
  }
};
