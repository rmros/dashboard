// https://www.npmjs.org/package/grunt-contrib-copy

module.exports = {
  dist: {
    options: {
      nonull: true
    },
    files: [{
      src: 'bower_components/animate.css/animate.css',
      dest: 'test/animate.css'
    }, {
      src: 'bower_components/animate.css/animate.js',
      dest: 'test/animate.js'
    }, {
      src: 'bower_components/es5-shim/es5-shim.js',
      dest: 'test/es5-shim.js'
    }]
  }
};
