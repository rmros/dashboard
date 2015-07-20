// https://www.npmjs.org/package/grunt-contrib-jshint

module.exports = {
	options: {
		reporter: require('jshint-stylish'),
		jshintrc: true,
		force: true
	},
	dist: ['jquery.stackbox.js']
};
