var gulp = require('gulp'),
    karmaServer = require('karma').Server;

gulp.task('scripts', function browserify_components() {
    // Compile our core.components.

    var babelify = require('babelify'),
        browserify = require('browserify'),
        buffer = require('vinyl-buffer'),
        rename = require('gulp-rename'),
        source = require('vinyl-source-stream'),
        sourcemaps = require('gulp-sourcemaps'),
        streamify = require('gulp-streamify'),
        uglify = require('gulp-uglify');

    return browserify({
            entries: ['js/core.js'],
            insertGlobals: true
        })
        // babel transforms our JS from es6/es2015 to parsable js in the browser
        // and also the React JSX style syntax we have
        .transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(source('core.browserify.js'))
        .pipe(buffer())
        // We must use buffer to load the whole file in order to generate sourcemaps
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write({includeContent: false, sourceRoot: './js/'}))
        // Write an unminified file
        .pipe(gulp.dest('./dist/'))
        // Minify
        .pipe(streamify(uglify()))
        .pipe(rename({
            extname: '.min.js'
        }))
        // Write the minified vile
        .pipe(gulp.dest('./dist/'));
});

gulp.task('karma', function karma(done){
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function() {
        done();
        // Clean the tests after karma has ran here
        // because we need to kill the process after karma exits.
        process.exit();
    }).start();
});

gulp.task('karma_watch', function karma_watch(done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        autoWatch: true,
        singleRun: false,
        usePolling: true
    }, function() {
        done();
        process.exit();
    }).start();
});

//gulp.task('test', gulp.series(karma));
//gulp.task('test', gulp.series(tasks.scripts.js_hint, karma));

module.exports = gulp;
