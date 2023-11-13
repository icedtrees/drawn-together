'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash')
var defaultAssets = require('./config/assets/default')

module.exports = function (grunt) {
  // Project Configuration
  grunt.initConfig({
    env: {
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--inspect'],
          ext: 'js,html',
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': defaultAssets.client.js
        }
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': 'public/dist/application.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': defaultAssets.client.css
        }
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 50,
          'hidden': []
        }
      }
    },
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  // Lint project files and minify them into two production files.
  grunt.registerTask('build', ['ngAnnotate', 'uglify', 'cssmin']);
};
