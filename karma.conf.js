'use strict';

module.exports = function(karma) {

    var src_path = './js',
        preprocessors = {};

    preprocessors[src_path+'/components/*.js'] = ['browserify'];
    preprocessors[src_path+'/tests/*.js'] = ['browserify'];

    karma.set({

        frameworks: [ 'jasmine', 'browserify' ],

        files: [
            {pattern: src_path+'/test_libs/*.js', watched: false, served: true, included: true},
            {pattern: src_path+'/components/**/*.js', watched: false, served: true, included: false},
            src_path+'/tests/**/*.js'
            //'test_libs/**/*.js'
        ],

        reporters: [ 'dots', 'coverage' ],

        preprocessors: preprocessors,

        browsers: [ 'PhantomJS' ],


        logLevel: 'LOG_DEBUG',

        // to avoid DISCONNECTED messages
        browserDisconnectTimeout : 10000, // default 2000
        browserDisconnectTolerance : 1, // default 0
        browserNoActivityTimeout : 60000, //default 10000

        // browserify configuration
        browserify: {
            debug: true,
            transform: [ ['babelify', {presets: ['babel-preset-es2015']}], 'browserify-istanbul' ]
        },

        coverageReporter: {
            reporters: [
                {type: 'html', dir:'./coverage/'},
                {type: 'text-summary'}
            ]
        }
    });
};
