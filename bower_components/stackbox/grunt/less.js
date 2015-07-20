// https://www.npmjs.org/package/grunt-contrib-less
// http://lesscss.org/usage/#command-line-usage

module.exports = {
	dist: {
		options: {
			compress: true,
			yuicompress: true,
			optimization: 2,
			sourceMap: true,
			sourceMapFilename: 'plugin/dist/jquery.stackbox.min.css.map',
			sourceMapBasepath: '',
			sourceMapRootpath: '../../'
		},
		files: {
			'plugin/dist/jquery.stackbox.min.css': 'plugin/src/jquery.stackbox.less'
		}
	},
	css: {
		options: {
			compress: false,
			sourceMap: false
		},
		files: {
			'plugin/src/jquery.stackbox.css': 'plugin/src/jquery.stackbox.less'
		}
	}
};
