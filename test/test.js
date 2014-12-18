'use strict';
/* eslint no-undef:0 */
var assert = require('assert');
var error = require('http-errors');
var request = require('supertest');
var express = require('express');

var handler = require('..');
var handlerOptions = { logger: 'winston' };

describe('Venzee Error Handler', function () {
  it('5xx', function (done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error(501, 'lol'));
    });
    app.use(handler(handlerOptions));

    request(app.listen())
    .get('/')
    .expect(501)
    .end(function (err, res) {
      assert.ifError(err);

      var body = res.body;
      assert.equal(body.message, 'Not Implemented');
      assert.equal(body.status, 501);
      done();
    });
  });

  it('4xx', function (done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error({ id: 'EmailAlreadyInUse' }));
    });
    app.use(handler(handlerOptions));

    request(app.listen())
    .get('/')
    .expect(400)
    .end(function (err, res) {
      assert.ifError(err);

      var re = /\/vocab>; rel/;
      var body = res.body;
      assert.equal(body.message, 'The email address you provided is already in use.');
      assert.equal(body.status, 400);
      assert.equal(body.code, 4000001);
      assert.equal(body['@id'], '/errors/EmailAlreadyInUse');
      assert.equal(body['@context'], '/contexts/Error.jsonld');
      assert(re.test(res.get('Link')), 'Link header does not have vocab path');
      done();
    });
  });

  it('Respects language requests', function(done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error({ id: 'EmailAlreadyInUse' }));
    });
    app.use(handler(handlerOptions));

    request(app.listen())
    .get('/')
    .set('Accept-Language', 'es, en;q=0.4')
    .expect(400)
    .end(function (err, res) {
      assert.ifError(err);

      var re = /\/vocab>; rel/;
      var body = res.body;
      assert.equal(body.message, 'El correo electrónico proporcionado se encuentra en uso.');
      assert.equal(body.status, 400);
      assert.equal(body.code, 4000001);
      assert.equal(body['@id'], '/errors/EmailAlreadyInUse');
      assert.equal(body['@context'], '/contexts/Error.jsonld');
      assert(re.test(res.get('Link')), 'Link header does not have vocab path');
      done();
    });
  });

  it('Defaults to English if no other languages can honor the request', function(done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error({ id: 'EmailAlreadyInUse' }));
    });
    app.use(handler(handlerOptions));

    request(app.listen())
    .get('/')
    .set('Accept-Language', 'pr')
    .expect(400)
    .end(function (err, res) {
      assert.ifError(err);

      var re = /\/vocab>; rel/;
      var body = res.body;
      assert.equal(body.message, 'The email address you provided is already in use.');
      assert.equal(body.status, 400);
      assert.equal(body.code, 4000001);
      assert.equal(body['@id'], '/errors/EmailAlreadyInUse');
      assert.equal(body['@context'], '/contexts/Error.jsonld');
      assert(re.test(res.get('Link')), 'Link header does not have vocab path');
      done();
    });
  });

  it('Handles unknown error ids', function(done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error({ id: 'UhhhhEmailAlreadyInUse' }));
    });
    app.use(handler(handlerOptions));

    request(app.listen())
    .get('/')
    .expect(500)
    .end(function (err, res) {
      assert.ifError(err);

      var re = /\/vocab>; rel/;
      var body = res.body;
      console.log(body);
      assert.equal(body.message, 'Unknown error id: UhhhhEmailAlreadyInUse');
      assert.equal(body.status, 500);
      assert.equal(body.code, 5000002);
      assert.equal(body['@id'], '/errors/UnknownErrorId');
      assert.equal(body['@context'], '/contexts/Error.jsonld');
      assert(re.test(res.get('Link')), 'Link header does not have vocab path');
      done();
    });
  });

  it('Supports custom error codes file option', function(done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error({ id: 'YoYoYoHoldUp' }));
    });
    handlerOptions.codes = './../test/fixtures/custom-codes';
    app.use(handler(handlerOptions));

    request(app.listen())
    .get('/')
    .expect(400)
    .end(function (err, res) {
      assert.ifError(err);

      var re = /\/vocab>; rel/;
      var body = res.body;
      console.log(body);
      assert.equal(body.message, 'Yo, yo, YO! Hold up, dude. Can\'t do that.');
      assert.equal(body.status, 400);
      assert.equal(body.code, 4000001);
      assert.equal(body['@id'], '/errors/YoYoYoHoldUp');
      assert.equal(body['@context'], '/contexts/Error.jsonld');
      assert(re.test(res.get('Link')), 'Link header does not have vocab path');
      done();
    });
  });

  it('Increments error codes correctly', function (done) {
    var nextCode = require('../').next400({
      FakeError: {
        code: 5000009,
        error: 'fake_error'
      },
      Foo: {
        code: 4000001,
        error: 'foo'
      },
      Bar: {
        code: 4000041,
        error: 'bar'
      }
    });

    assert.equal(nextCode, 4000042);
    done();
  });

});
