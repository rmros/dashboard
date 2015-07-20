// https://www.npmjs.org/package/grunt-contrib-uglify

module.exports = {
	options: {
		banner: '/*! <%= package.name %> v<%= package.version %> <%= grunt.template.today("dd.mm.yyyy") %> */\n',
		sourceMap: true
	},
	dist: {
		files: {
			'plugin/dist/jquery.stackbox.min.js': [
				'plugin/src/jquery.stackbox.js'
			]
		}
	}
};
