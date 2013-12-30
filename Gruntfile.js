'use strict';

module.exports = function(grunt) {

  var jqueries = ['1.7.0', '1.9.0', '1.10.2'];
  // var jqueries = ['1.7.0', '1.9.0', '1.10.2', '2.0.3'];

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('bower.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    connect: {
      server: {
        options: {
          port: 8085 // This is a random port, feel free to change it.
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        report: 'gzip'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
    },
    qunit: {
      all: {
        options: {
          urls: (function() {
            var path, arr = [], paths = [
            'http://localhost:<%= connect.server.options.port %>/test/test.html',
            'http://localhost:<%= connect.server.options.port %>/test/keyboard.html'
            ];
            for (var i = 0; i < paths.length; i++) {
              path = paths[i];
              for (var y = 0; y < jqueries.length; y++) {
                arr.push( path + '?jquery=' + jqueries[y] );
              }
              arr.push( path );
            }
            return arr;
          })()
        }
      },
      dev: {
        src: ['./test/*.html']
      }
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit:dev']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:src', 'qunit:dev']
      },
    },
    replace: {
      all: {
        options: {
          patterns: [{
            match: /\s*\/\* DEVELOPMENT \*\/(\n|.)+\}\(jQuery, window\)\);\n*$/,
            replacement: '\n\n}(jQuery, window));',
            expression: true
          }]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ['<%= concat.dist.dest %>'],
            dest: 'dist/'
          }
        ]
        
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-replace');

  // Register Tasks.
  grunt.registerTask('default', ['connect','jshint', 'qunit:all', 'clean', 'concat', 'replace', 'uglify']);
  grunt.registerTask('test', ['connect', 'jshint', 'qunit:all']);
  grunt.registerTask('dtest', ['jshint', 'qunit:dev']);

};
