'use strict';

const logger = require('./lib/logger');

const hof = require('hof');
const metrics = require('./lib/metrics');

const config = require('./config');

const app = hof({
  build: {
    translate: {
      shared: './apps/common/translations/src'
    }
  },
  behaviours: [
    require('./behaviours/fields-filter'),
    require('./behaviours/page-analytics'),
    require('hof-behaviour-feedback').SetFeedbackReturnUrl
  ],
  routes: [
    require('./apps/common'),
    require('./apps/apply/'),
    require('./apps/accept/')
  ],
  views: require('hof-behaviour-loop').views,
  loglevel: config.hofLogLevel
});

app.use((req, res, next) => {
  // Set HTML Language
  res.locals.htmlLang = 'en';
  res.locals.feedbackUrl = '/feedback';
  res.locals.footerSupportLinks = [
    { path: '/cookies', property: 'base.cookies' },
    { path: '/terms-and-conditions', property: 'base.terms' },
    { path: '/accessibility', property: 'base.accessibility' },
  ];
  next();
});

app.use('/insight', metrics());

logger.info('RIL application started');
