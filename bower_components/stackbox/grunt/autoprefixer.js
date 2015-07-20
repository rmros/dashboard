// https://www.npmjs.org/package/grunt-autoprefixer

module.exports = {
	dist: {
		options: {
			browsers: ['last 2 versions', 'ie 9'],
			map: true
		},
		files: {
			'plugin/dist/jquery.stackbox.min.css': ['plugin/dist/jquery.stackbox.min.css']
		}
	}
};
