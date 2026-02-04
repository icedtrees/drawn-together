'use strict';

module.exports = function (app) {
  const auth = require('../controllers/auth.server.controller');

  app.route('/api/auth/signin').post(auth.signin);
  app.route('/api/auth/signout').get(auth.signout);
};
