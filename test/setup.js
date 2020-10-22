/* eslint no-process-env: 0 */
'use strict';

process.env.PORT = 9080;
process.env.NODE_ENV = 'test';
process.env.NOTIFY_KEY = 'UNIT_TEST';

global.chai = require('chai')
    .use(require('sinon-chai'))
    .use(require('chai-as-promised'));
global.should = chai.should();
global.expect = chai.expect;
global.assert = require('assert');
global.sinon = require('sinon');
global.proxyquire = require('proxyquire');
global.path = require('path');
global.config = require('../config');
global._ = require('lodash');
global.utils = require('./helpers/supertest_session/supertest-utilities.js');

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
