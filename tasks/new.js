'use strict';

module.exports = function (grunt) {

  grunt.registerTask('new',
    'Create a new error code.',
    [
      'prompt:vcodes',
      'update-codes'
    ]
  );
};
