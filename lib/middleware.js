'use strict';
/* eslint no-unused-vars:0 */
var statuses = require('./statuses');

var production = process.env.NODE_ENV === 'production';

module.exports = function () {
  return function venzeeErrorHandler(err, req, res, next) {
    var status = err.status || err.statusCode || 500;
    if (status < 400) {
      status = 500;
    }
    res.statusCode = status;

    var body = {
      status: status
    };

    if (!production) {
      body.stack = err.stack;
    }

    // internal server errors
    if (status >= 500) {
      var logger = require('venzee-logger');
      logger.error(req.url, err.stack);
      body.message = statuses[status];
      res.json(body);
      return;
    }

    // client errors
    body.message = err.message;

    if (err.code) {
      body.code = err.code;
    }
    if (err.name) {
      body.name = err.name;
    }
    if (err.type) {
      body.type = err.type;
    }

    res.json(body);
  };
};
