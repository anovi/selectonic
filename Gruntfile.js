'use strict';

module.exports = function (grunt) {

  grunt.task.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({


    pkg: grunt.file.readJSON('package.json'),

    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      
      multi: {
        files: {
          './jquery.multiSelectable.min.js': ['jquery.multiSelectable.js']
        }
      }
    }

  });

  grunt.registerTask('minify', [
    'uglify',
  ]);

  grunt.registerTask('default', [
    'minify'
  ]);

};
