
module.exports = function (grunt) {
  'use strict';

  grunt.task.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  /*
    Config
  */
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    
    uglify: {
      options: {
        report: 'gzip',
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      multi: {
        files: {
          './jquery.multiSelectable.min.js': ['jquery.multiSelectable.js']
        }
      }
    },

    jshint: {
      options: {
        ignores: ['*.min.js']
      },
      all: ['*.js'],
    }

  });


  /*
    Tasks
  */
  grunt.registerTask('minify', [
    'uglify',
  ]);

  grunt.registerTask('default', [
    'jshint',
    'minify'
  ]);


};
