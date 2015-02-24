'use strict';
var util = require('util');
var path = require('path');
var statuses = require('statuses');
var titleCase = require('title-case');
var pascalCase = require('pascal-case');
var debug = require('debug')('venzee-errors');

/**
 *
 * Support a file called `venzee-error-codes.json` at the same location
 * of the file which included the module.
 *
 * In the case of LoopBack, if you require venzee-errors in server/server.js,
 * a file located at server/venzee-error-codes.json would be used instead
 * of the bundled codes.json file.
 *
 */

var codes = require('./codes');

var venzeeErrorData = function venzeeErrorData(str) {

  str = String(str);

  var key = '';

  // str could be BumpyCase or CONSTANT_CASE
  key = codes.constants[str];
  if (!key) {
    key = str;
  }

  var errorData = codes[key];
  if (!errorData) {
    key = 'UnknownErrorId';
    errorData = codes[key];
  }

  errorData.key = key;

  return errorData;
};

var venzeeErrors = function venzeeErrors(str) {

  var errObj;
  var atId;
  var statusMsg;

  // is this already an Error?
  if (util.isError(str)) {

    errObj = str;
    var status = errObj.status || errObj.statusCode || 500;

    // is it an error with an error-level status?
    if (status < 400) {
      // let's not mess wth this
      return errObj;
    }

    statusMsg = statuses[status];
    debug('status message is %s', statusMsg);

    if (!statusMsg) {
      statusMsg = errObj.message;
      debug('status message was undefined; statusMsg: %s', statusMsg);
    }

    errObj.statusDescription = statusMsg;
    if (!errObj.name) {
      errObj.name = pascalCase(statusMsg);
    }

    debug('errObj.name: %s', errObj.name);
    atId = '/errors/' + errObj.name;

    if (errObj.name === 'Error') {
      // lame!
      atId = '/errors/' + pascalCase(statusMsg) + 'Error';
    }
    errObj['@context'] = '/contexts/Error.jsonld';

    // let's not have any SomethingErrorError errors generated.
    if (atId.substr(-5) !== 'Error') {
      atId += 'Error';
    }
    errObj['@id'] = atId;

    if (!errObj.code) {
      // push HTTP status codes into the high-range of the Venzee codes
      var tmp = String(status);
      errObj.code = tmp[0] + '00' + tmp + '0';
      errObj.code = parseInt(errObj.code, 10);
    }

  } else {

    var data = venzeeErrorData(str);
    errObj = new Error(data.description.en);
    errObj.name = data.key;
    errObj['@context'] = '/contexts/Error.jsonld';
    errObj['@id'] = '/errors/' + data.key + 'Error';
    errObj.status = data.status;
    statusMsg = statuses[data.status];
    if (!statusMsg) {
      statusMsg = titleCase(data.key);
    }
    errObj.statusDescription = statusMsg;
    errObj.code = data.code;

  }

  errObj.toBody = function() {
    var self = errObj;
    var body = {
      error: {
        name: self.name,
        message: self.message,
        '@context': self['@context'],
        '@id': self['@id'],
        code: self.code,
        statusDescription: self.statusDescription
      }
    };

    // Something for everyone! Whee!
    if (self.status) {
      body.error.status = self.status;
    } else if (self.statusCode) {
      body.error.status = self.statusCode;
    }

    if (self.statusCode) {
      body.error.statusCode = self.statusCode;
    } else if (self.status) {
      body.error.statusCode = self.status;
    }

    // Validation errors have details
    if (self.details) {
      body.error.details = self.details;
    }

    return body;
  };

  return errObj;
};

var exports = module.exports = venzeeErrors;

exports.venzeeErrorData = venzeeErrorData;

exports.allCodes = function allCodes() {
  return codes;
};

exports.E = codes.constants;
