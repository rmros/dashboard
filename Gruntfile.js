module.exports = function(grunt) {
  
  grunt.initConfig({
	  watch: {
	    all: {
	      options: { livereload: true },
	      files: '**/*.*'
	    },
	  },

	  express: {
	    all: {
	      options: { 
	      	port :1440,
	      	hostname : 'localhost',
	      	livereload: true,
	      	bases : ['.']
	      }
	    },
	  },

	  
	  
	});


	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.registerTask('default', ['express','watch']);

};