module.exports = function(grunt){

  // tell JSLint that, concerning global variables, everything's gonna
  // be okay :-)
  
  /* globals:
      grunt: true
  */
  
  'use strict';

  grunt.loadNpmTasks('grunt-traceur');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({

    // because awesome people use ES6
    traceur: {
      options: {
        // traceur options here 
        experimental: true,
        sourcemap: true,
        moduleNames: true,
        // module naming options, 
        moduleNaming: {
          
          
        },
        copyRuntime: 'frontend/build/js'
      },
      custom: {

        files: [{
          expand: true,
          cwd: 'frontend/src/js',
          src: ['*.js', '**/*.js'],
          dest: 'frontend/build/js'
        }]
      },
    },

    copy: {
			dev: {
				files: [{
					expand: true,
					cwd:'frontend/src/',
					src: ['**/*.html', '*.html', 'bower_components/**/*.js', 'angular2/*.js', 'angular2/**/*.js', 'angular2/*.map', 'angular2/**/*.map'],
					dest: 'frontend/build/'
					}]
			
			},
		},

    watch: {
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['traceur', 'copy:dev']
      },
      livereload: {
        files: ['frontend/src/*.html', 'frontend/src/js/*.js', 'frontend/src/js/**/*.js'],
        tasks: ['traceur', 'copy:dev'],
        options: {
          livereload: true
        }
      }
    },

    connect: {
      dev: {
        options: {
          port: 9000,
          base: 'frontend/build/',
          open: false,
          livereload: true,
          hostname: 'localhost'
        }
      }
    },

  });

  grunt.registerTask('default', ['traceur', 'copy:dev', 'connect:dev', 'watch']);
};