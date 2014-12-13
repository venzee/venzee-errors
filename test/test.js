'use strict';
/* eslint no-undef:0 */
var assert = require('assert');
var error = require('http-errors');
var request = require('supertest');
var express = require('express');

var handler = require('..');

var status = require('..').venzeeStatus;

describe('Statuses', function () {
  describe('codes', function () {
    it('should include all of node\'s', function () {
      var codes = require('http').STATUS_CODES;
      Object.keys(codes).forEach(function (code) {
        assert(status(code));
      });
    });
  });

  describe('.redirect', function () {
    it('should include 308', function () {
      assert(status.redirect[308]);
    });
  });

  describe('status', function () {
    describe('(number)', function () {
      it('should be truthy when valid', function () {
        assert(status(404));
      });

      it('should throw when invalid', function () {
        assert.throws(function () {
          status(0);
        });
      });
    });

    describe('(number string)', function () {
      it('should be truthy when valid', function () {
        assert(status('404'));
      });

      it('should throw when invalid', function () {
        assert.throws(function () {
          status('0');
        });
      });
    });

    describe('(status string)', function () {
      it('should be truthy when valid', function () {
        assert(status('Not Found'));
      });

      it('should throw when invalid', function () {
        assert.throws(function () {
          status('asdf');
        });
      });
    });

    it('should throw a TypeError on anything but numbers and strings', function () {
      assert.throws(function () {
        status([]);
      });
    });
  });
});



describe('API Error Handler', function () {
  it('5xx', function (done) {
    var app = express();
    app.use(function (req, res, next) {
      next(error(501, 'lol'));
    });
    app.use(handler());

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
      next(error(401, 'lol', {
        type: 'a',
        code: 'b'
      }));
    });
    app.use(handler());

    request(app.listen())
    .get('/')
    .expect(401)
    .end(function (err, res) {
      assert.ifError(err);

      var body = res.body;
      assert.equal(body.message, 'lol');
      assert.equal(body.status, 401);
      assert.equal(body.type, 'a');
      assert.equal(body.code, 'b');
      done();
    });
  });
});
