'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/angular-bootstrap-colorpicker/css/colorpicker.min.css',
        'public/lib/font-awesome/css/font-awesome.min.css'
      ],
      js: [
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
        'public/lib/angular-scroll-glue/src/scrollglue.js',
        'public/lib/angular-sanitize/angular-sanitize.js'
      ]
    },
    css: [
      'public/modules/core/client/css/*.css', // core css must come before other modules
      'public/modules/*/client/css/*.css',
      'modules/*/client/css/*.css'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/shared/*.js',
      'modules/*/shared/**/*.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
  }
};
