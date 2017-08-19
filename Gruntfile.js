module.exports = function(grunt) {

	// Project configuration. 
	grunt.initConfig({
	  concat: {
	    dist: {
	      src: ['js/game.js', 'js/resources.js', 'js/entities/entities.js', 'js/entities/HUD.js', 'js/screens/play.js'],
	      dest: 'build/scripts.js',
	    },
	  },

	  watch: {
		scripts: {
		  files: ['js/**/*.js'],
	      tasks: ['concat'],
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

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('serve', ['concat', 'connect', 'watch']);
};