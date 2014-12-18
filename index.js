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
