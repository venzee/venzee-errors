'use strict';

module.exports = function(grunt) {
  var path = require('path');

  // load our configs and tasks automatically
  require('load-grunt-config')(grunt, {
    configPath: path.join(process.cwd(), 'tasks', 'config')
  });

  // load our custom tasks
  grunt.loadTasks('tasks');

  // track how long tasks take
  require('time-grunt')(grunt);
};
