'use strict';

module.exports = {
  app: {
    title: 'Drawn Together',
    description: 'Pictionary online.',
    keywords: 'pictionary, isketch, drawing, game, multiplayer, online',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
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
  // email settings
  mailer: {
    from: process.env.MAILER_FROM || 'Drawn Together',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'noreply.drawntogether@gmail.com',
        pass: process.env.MAILER_PASSWORD || 'rollingdownmainwalkway'
      }
    }
  },
  logo: 'modules/client/core/img/brand/logo.png',
  favicon: 'modules/client/core/img/brand/favicon.ico'
};
