'use strict';

const hof = require('hof');
const path = require('path');

const app = hof({
  behaviours: [
    require('./behaviours/fields-filter'),
    require('./behaviours/page-analytics'),
    require('hof-behaviour-feedback').SetFeedbackReturnUrl
  ],
  routes: [
    require('./apps/apply/'),
    require('./apps/accept/')
  ],
  views: require('hof-behaviour-loop').views
});

app.use((req, res, next) => {
  // Set HTML Language
  res.locals.htmlLang = 'en';
  res.locals.footerSupportLinks = [
    { path: '/cookies', property: 'base.cookies' },
    { path: '/terms-and-conditions', property: 'base.terms' },
    { path: '/accessibility', property: 'base.accessibility' },
  ];
  next();
});