'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  defaultAssets = require('./config/assets/default'),
  fs = require('fs'),
  path = require('path');

module.exports = function (grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    watch: {
      serverViews: {
        files: defaultAssets.server.views,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS),
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientViews: {
        files: defaultAssets.client.views,
        options: {
          livereload: true
        }
      },
      clientJS: {
        files: defaultAssets.client.js,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: defaultAssets.client.css,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      },
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--inspect'],
          ext: 'js,html',
          watch: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    jshint: {
      all: {
        src: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS, defaultAssets.client.js),
        options: {
          jshintrc: true,
          node: true,
          mocha: true,
          jasmine: true
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: defaultAssets.client.css.slice().concat(
          defaultAssets.client.csslint_exclude.map(function (s) { return '!' + s })
        )
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
    copy: {
      localConfig: {
        src: 'config/env/local.example.js',
        dest: 'config/env/local.js',
        filter: function () {
          return !fs.existsSync('config/env/local.js');
        }
      }
    }
  });

  grunt.event.on('coverage', function(lcovFileContents, done) {
    require('coveralls').handleInput(lcovFileContents, function(err) {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  // Make sure upload directory exists
  grunt.task.registerTask('mkdir:upload', 'Task that makes sure upload directory exists.', function () {
    // Get the callback
    var done = this.async();

    grunt.file.mkdir(path.normalize(__dirname + '/modules/users/client/img/profile/uploads'));

    done();
  });

  // Connect to the MongoDB instance and load the models
  grunt.task.registerTask('mongoose', 'Task that connects to the MongoDB instance and loads the application models.', function () {
    // Get the callback
    var done = this.async();

    // Use mongoose configuration
    var mongoose = require('./config/lib/mongoose.js');

    // Connect to database
    mongoose.connect(function (db) {
      done();
    });
  });

  grunt.registerTask('mongo-drop', 'Drop mongodb database.', function() {
    var options,
        mongoose = require('mongoose'),
        done = this.async(),
        db;

    options = this.options({
      dbname: 'mean-dev',
      host: 'localhost'
    });

    grunt.verbose.writeflags(options, 'Options');

    db = mongoose.connect('mongodb://' + options.host + '/' + options.dbname, function(err) {
      if (err) {
        grunt.log.writeln('Could not connect to mongodb -- is mongo running?');
        done(err);
      } else {
        grunt.log.writeln('Open db connection');
        db.connection.db.dropDatabase(function(err) {
          if (err) {
            grunt.log.writeln('Could not drop database');
            done(err);
          } else {
            grunt.log.writeln('Database dropped');
            done();
          }
        });
      }
    });
  });

  grunt.task.registerTask('server', 'Starting the server', function () {
    // Get the callback
    var done = this.async();

    var path = require('path');
    var app = require(path.resolve('./config/lib/app'));
    var server = app.start(function () {
      done();
    });
  });

  grunt.task.registerTask('install', 'install the backend and frontend dependencies', function() {
    var exec = require('child_process').exec;
    var cb = this.async();
    exec('npm install', {}, function(err, stdout, stderr) {
      console.log(stdout);
      cb();
    });
  });

  // Lint CSS and JavaScript files.
  grunt.registerTask('lint', ['jshint', 'csslint']);

  // Lint project files and minify them into two production files.
  grunt.registerTask('build', ['install', 'env:dev', 'lint', 'ngAnnotate', 'uglify', 'cssmin', 'mkdir:upload', 'copy:localConfig']);

  // Run the project in development mode
  grunt.registerTask('default', ['install', 'env:dev', 'lint', 'mkdir:upload', 'copy:localConfig', 'concurrent:default']);

  // Run the project in debug mode
  grunt.registerTask('debug', ['install', 'env:dev', 'lint', 'mkdir:upload', 'copy:localConfig', 'concurrent:debug']);

  // Run the project in production mode
  grunt.registerTask('prod', ['build', 'concurrent:default']);
};
