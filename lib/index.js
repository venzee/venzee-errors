'use strict';
/* eslint no-unused-vars:0 */
var statuses = require('statuses');
var Negotiator = require('negotiator');
var Options = require('options');

var production = process.env.NODE_ENV === 'production';

module.exports = function (options) {

  // get options
  var defaultOptions = {
    logger: 'venzee-logger',
    codes: './codes'
  };
  var option = new Options(defaultOptions);
  option.merge(options);

  return function venzeeErrorHandler(err, req, res, next) {
    var status = err.status || err.statusCode || 500;
    if (!err.id || status < 400) {
      err.id = 'Unknown';
    }

    var logger = require(option.value.logger);
    var codes = require(option.value.codes);

    var venzeeError = codes[err.id];

    // NOT COOL
    if (!venzeeError && !production) {
      logger.error(req.url, 'UNKNOWN ERROR ID: ' + err.id, err.stack);
      venzeeError = codes.UnknownErrorId;
      venzeeError.description.en = venzeeError.description.en + ': ' + err.id;
      err.id = 'UnknownErrorId';
      status = 500;
    }

    if (venzeeError.code < 5000000) {
      status = 400;
    }

    res.statusCode = status;

    // Link header even in errors
    res.set('Link', '<' + req.hostname + '/vocab>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"');

    var body = {
      status: status,
      '@context': '/contexts/Error.jsonld',
      '@id': '/errors/' + err.id,
      code: venzeeError.code
      // @TODO uri for more information
    };

    // which message?
    var negotiator = new Negotiator(req);
    var availableLanguages = Object.keys(venzeeError.description);
    var lang = negotiator.language(availableLanguages);
    // default to English
    if (!lang) {
      lang = 'en';
    }
    body.message = venzeeError.description[lang];

    if (!production) {
      body.stack = err.stack;
    }

    // internal server errors
    if (status >= 500) {
      logger.error(req.url, err.stack);
      if (status > 500) {
        body.message = statuses[status];
      }
      res.json(body);
      return;
    }

    res.json(body);
  };
};
