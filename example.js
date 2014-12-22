'use strict';

var util = require('util');
var venzeeError = require('./index');
// handy shortcut for ACCESSING_CONSTANTS
var E = venzeeError.E;

var err = venzeeError(E.USERNAME_UNAVAILABLE);
console.info('Error message:');
console.log(err.message);

if (util.isError(err)) {
  console.log('\n\nutil.isError calls this an error!');
}

// what gets returned in error reponse bodies:
console.info('\n\nA message body payload:');
console.log(JSON.stringify(err.toBody(), null, 2));

// what about non-venzee-specific errors?
// here's a simulation of Loopback's url-not-found error
var req = {
  method: 'GET',
  url: '/not-there'
};

// lifted from strong-remoting RestAdapter.urlNotFoundHandler
var message = 'There is no method to handle ' + req.method + ' ' + req.url;
var error = new Error(message);
error.status = error.statusCode = 404;
console.info('\n\nPayload of strong-remoting RestAdapter.urlNotFoundHandler:');
var mock = {
  error: {
    name: 'Error',
    status: 404,
    message: message,
    statusCode: 404
  }
};
console.log(JSON.stringify(mock, null, 2));

// now we have this:
console.info('\n\nSame error through venzeeErrors:');
err = venzeeError(error);
console.log(JSON.stringify(err.toBody(), null, 2));

// now, the fancy stuff
console.info('\n\nHow about loopback-datasource-juggler ValidationError?');

// borrowed from init.js in loopback-datasource-juggler test suite
function getValidAttributes() {
  return {
    firstName: 'Anatoliy',
    email: 'email@example.com',
    state: '',
    age: 26,
    gender: 'male',
    createdByAdmin: false,
    createdByScript: true
  };
}

//var ValidationError = require('loopback-datasource-juggler').ValidationError;
var ModelBuilder = require('loopback-datasource-juggler').ModelBuilder;
var Schema = require('loopback-datasource-juggler').Schema;

if (!('getSchema' in global)) {
  global.getSchema = function (connector, settings) {
    return new Schema(connector || 'memory', settings);
  };
}

if (!('getModelBuilder' in global)) {
  global.getModelBuilder = function () {
    return new ModelBuilder();
  };
}

var db = getSchema();
var user = db.define('user', {
  email: String,
  firstName: String,
  lastName: String,
  password: String,
  state: String,
  age: Number,
  gender: String,
  domain: String,
  pendingPeriod: Number,
  createdByAdmin: Boolean,
  createdByScript: Boolean,
  updatedAt: Date
});
user.validatesPresenceOf('firstName');
user.validatesPresenceOf('lastName');
user.validatesPresenceOf('state');

var input = getValidAttributes();
input.state = 'CA';
input.firstName = null;

user.create(input, function (e, u) {
  if (e) {
    console.log('\nStandard ValidationError:');
    mock = {
      error: e
    };
    console.log(JSON.stringify(mock, null, 2));

    console.log('\nSame error through venzeeErrors:');
    err = venzeeError(e);
    console.log(JSON.stringify(err.toBody(), null, 2));
  }
});
