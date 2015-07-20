// https://www.npmjs.org/package/grunt-contrib-qunit

module.exports = {
	travis: {
		options: {
			urls: [
				'http://127.0.0.1:8081/test/index.html'
			],
			timeout: 10000,
			screenshot: false
		}
	},
	local: {
		options: {
			urls: [
				'http://127.0.0.1:8081/test/local.html'
			],
			timeout: 5000,
			screenshot: true
		}
	}
};
