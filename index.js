'use strict';
// the middleware is the main module
exports = module.exports = require('./lib/middleware');

// expose the codes alone
exports.venzeeStatus = require('./lib/statuses');
