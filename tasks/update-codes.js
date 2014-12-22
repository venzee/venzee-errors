'use strict';

module.exports = function (grunt) {

  function nextErrorCode(codes, statusCode) {

    var series = 5000000;
    if (statusCode < 500) {
      series = 4000000;
    }

    var theSeries = [];

    for (var k in codes) {
      if (codes[k].code < series) {
        theSeries.push(codes[k].code);
      }
    }

    var max = Math.max.apply(null, theSeries);
    return max + 1;
  }

  grunt.registerTask('update-codes',
    'Update the known Venzee error codes.', function () {

      var newStatusCode = grunt.config('vcodes.options.statuscode');
      var newName = grunt.config('vcodes.options.name');
      var newMessage = grunt.config('vcodes.options.message');

      var codes = grunt.file.readJSON('./codes.json');
      var changeCase = require('change-case');

      // add any new codes to the list
      if (newName) {
        newName = newName.trim();

        var snake = changeCase.snakeCase(newName);
        var bumpy = changeCase.pascalCase(newName);

        var statusCode = newStatusCode - 0;
        var nextCode = nextErrorCode(codes, statusCode);

        // add the code to the list!
        codes[bumpy] = {
          status: statusCode,
          code: nextCode,
          error: snake,
          description: {
            en: newMessage
          }
        };
      }

      // keep it tidy
      var keys = Object.keys(codes);
      var len = keys.length;
      var sorted = {};
      var k, i;
      keys.sort();

      var constants = {};

      for (i = 0; i < len; i++) {
        k = keys[i];
        if (k !== 'constants') {
          sorted[k] = codes[k];
        }
        var c = changeCase.constantCase(k);
        constants[c] = k;
      }
      sorted.constants = constants;

      var newCodes = JSON.stringify(sorted, undefined, 2);
      console.log(newCodes);
      grunt.file.write('./codes.json', newCodes);

      // TODO update localize translations of code messages
      // Not yet complete.
      if (grunt.file.exists('./.localizejs')) {
        var dotLocalizejs = grunt.file.readJSON('./.localizejs');
        var localizejs = require('localizejs');
        var client = localizejs.createClient(dotLocalizejs.platform);
        var project = client.project(dotLocalizejs.project[0].key);
        var done = this.async();

        var dictionary = project.dictionary('es');

        dictionary.translate('hello', function(translation) {
          console.log(translation);
          done();
        });
      }
    }
  );
};
