'use strict';

const DEFAULT_PROFILE_IMAGE_URL = 'modules/client/users/img/profile/default.png';

const normalizeUsername = function (value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

exports.signin = function (req, res) {
  const username = normalizeUsername(req.body && req.body.username);

  if (!username) {
    return res.status(400).json({message: 'Username is required.'});
  }
  if (username.length > 24) {
    return res.status(400).json({message: 'Username must be 24 characters or fewer.'});
  }

  const user = {
    username: username,
    profileImageURL: DEFAULT_PROFILE_IMAGE_URL
  };

  if (req.session) {
    req.session.user = user;
  }

  return res.json(user);
};

exports.signout = function (req, res) {
  if (req.session) {
    req.session.destroy(function () {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
};
