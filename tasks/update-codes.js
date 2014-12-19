'use strict';

module.exports = function (grunt) {

  grunt.registerTask('update-codes',
    'Update the known Venzee error codes.', function () {

      var newStatusCode = grunt.config('vcodes.options.statuscode');
      var newName = grunt.config('vcodes.options.name');
      var newMessage = grunt.config('vcodes.options.message');

      // add any new codes to the list
      if (newName) {
        var changeCase = require('change-case');
        newName = newName.trim();

        var snake = changeCase.snakeCase(newName);
        var bumpy = changeCase.pascalCase(newName);

        var codes = grunt.file.readJSON('./lib/codes.json');

        var statusCode = newStatusCode - 0;
        var nextCode;
        if (statusCode < 500) {
          nextCode = require('../').next400(codes);
        } else {
          nextCode = require('../').next500(codes);
        }


        // add the code to the list!
        codes[bumpy] = {
          status: statusCode,
          code: nextCode,
          error: snake,
          description: {
            en: newMessage
          }
        };

        // keep it tidy
        var keys = Object.keys(codes);
        var len = keys.length;
        var sorted = {};
        var k, i;
        keys.sort();

        for (i = 0; i < len; i++) {
          k = keys[i];
          sorted[k] = codes[k];
        }

        var newCodes = JSON.stringify(sorted, undefined, 2);
        console.log(newCodes);
        grunt.file.write('./lib/codes.json', newCodes);
      }

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
