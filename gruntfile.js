'use strict';


module.exports = function (grunt) {
  grunt.initConfig({
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': [
            'modules/core/client/app/config.js',
            'modules/core/client/app/init.js',
            'modules/*/shared/*.js',
            'modules/*/shared/**/*.js',
            'modules/*/client/*.js',
            'modules/*/client/**/*.js',
          ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': [
            'public/modules/core/client/css/*.css', // core css must come before other modules
            'public/modules/*/client/css/*.css',
            'modules/*/client/css/*.css',
          ]
        }
      }
    },
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('build', ['ngAnnotate', 'cssmin']);
};
