'use strict';
// the middleware is the main module
exports = module.exports = require('./lib');

// next available 400-space code
exports.next400 = function(codes) {
  var fourSeries = [];

  for (var k in codes) {
    if (codes[k].code < 5000000) {
      fourSeries.push(codes[k].code);
    }
  }

  var max = Math.max.apply(null, fourSeries);
  return max + 1;
};

// next available 500-space code
exports.next500 = function(codes) {
  var fiveSeries = [];

  for (var k in codes) {
    if (codes[k].code >= 5000000) {
      fiveSeries.push(codes[k].code);
    }
  }

  var max = Math.max.apply(null, fiveSeries);
  return max + 1;
};