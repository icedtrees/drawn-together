'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  multer = require('multer'),
  favicon = require('serve-favicon'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  flash = require('connect-flash'),
  consolidate = require('consolidate'),
  path = require('path');

var rootDir = path.resolve(__dirname, '..', '..');

var resolveEnv = function () {
  var env = process.env.NODE_ENV || 'development';
  if (env !== 'development' && env !== 'production') {
    env = 'development';
    process.env.NODE_ENV = env;
  }
  return env;
};

var env = resolveEnv();
var isDevelopment = env === 'development';

var config = {
  app: {
    title: isDevelopment ? 'Drawn Together - Development Environment' : 'Drawn Together',
    description: 'Pictionary online.'
  },
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret changed for security measures and concerns
  sessionSecret: '29ToF2W>JWi18a47l~Mt^S',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  livereload: isDevelopment,
  logo: 'modules/client/core/img/brand/logo.png',
  favicon: 'modules/client/core/img/brand/favicon.ico'
};

var moduleConfigs = [];
var modulePolicies = [];
var moduleRoutes = [
  path.join(rootDir, 'modules/server/auth/routes/auth.server.routes.js'),
  path.join(rootDir, 'modules/server/topics/routes/topics.server.routes.js'),
  // Core routes include the /api/* 404 catch-all, so they must be last.
  path.join(rootDir, 'modules/server/core/routes/core.server.routes.js')
];

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.livereload = config.livereload;
  app.locals.logo = config.logo;
  app.locals.favicon = config.favicon;

  // Passing the request url to environment locals
  app.use(function (req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    next();
  });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
  // Showing stack errors
  app.set('showStackError', true);

  // Enable jsonp
  app.enable('jsonp callback');

  // Should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Initialize favicon middleware
  app.use(favicon(path.join(rootDir, 'modules/client/core/img/brand/favicon.ico')));

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // Add the cookie parser and flash middleware
  app.use(cookieParser());
  app.use(flash());

  // Add multipart handling middleware
  app.use(multer({
    dest: './modules/client/users/img/profile/uploads/',
    inMemory: true
  }));
};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function (app) {
  // Set swig as the template engine
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set views path and view engine
  app.set('view engine', 'server.view.html');
  app.set('views', './');
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app) {
  const sessionMiddleware = session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionCookie.maxAge,
      httpOnly: config.sessionCookie.httpOnly,
      secure: config.sessionCookie.secure
    },
    key: config.sessionKey
  });

  app.set('sessionMiddleware', sessionMiddleware);
  app.use(sessionMiddleware);

  app.use(function (req, res, next) {
    req.user = req.session ? req.session.user : null;
    res.locals.user = req.user || null;
    next();
  });
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function (app) {
  moduleConfigs.forEach(function (configPath) {
    require(configPath)(app);
  });
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function (app) {
  // Use helmet to secure Express headers
  var SIX_MONTHS = 15778476000;
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = function (app) {
  // Setting the app router and static folder
  // Resolve relative to this file so it works regardless of process.cwd()
  app.use('/', express.static(path.resolve(__dirname, '../../public')));
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function (app) {
  modulePolicies.forEach(function (policyPath) {
    require(policyPath).invokeRolesPolicies();
  });
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function (app) {
  moduleRoutes.forEach(function (routePath) {
    require(routePath)(app);
  });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
  app.use(function (err, req, res, next) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    // Redirect to error page
    res.redirect('/server-error');
  });
};

/**
 * Configure Socket.io
 */
module.exports.configureSocketIO = function (app) {
  // Load the Socket.io configuration
  var server = require('./socket.io')(app);

  // Return server object
  return server;
};

/**
 * Initialize the Express application
 */
module.exports.init = function () {
  // Initialize express app
  var app = express();

  // Initialize local variables
  this.initLocalVariables(app);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Express view engine
  this.initViewEngine(app);

  // Initialize Express session
  this.initSession(app);

  // Initialize Modules configuration
  this.initModulesConfiguration(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize modules static client routes
  this.initModulesClientRoutes(app);

  // Initialize modules server authorization policies
  this.initModulesServerPolicies(app);

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  // Configure Socket.io
  app = this.configureSocketIO(app);

  return app;
};
