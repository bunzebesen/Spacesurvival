module.exports = function(grunt) {

	// Project configuration. 
	grunt.initConfig({
	  copy: {
	    build: {
	      files: [
	        // includes files within path and its sub-directories 
	        {expand: true, src: ['js/**'], dest: 'build/'},
	        {expand: true, src: ['data/**'], dest: 'build/'},

	      ],
	    },
	  },

	  watch: {
		scripts: {
		  files: ['js/**/*.js', 'data/**/*.json',
		  		  'data/**/*.tmx',
		  		  'data/**/*.png'],
	      tasks: ['copy'],
	    },
	  },

	  connect: {
        server: {
          options: {
            port: 8000,
          }
        }
      },
    });

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('server', ['copy', 'connect', 'watch']);
};