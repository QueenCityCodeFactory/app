const prefix = require('autoprefixer');
const beep = require('beepbeep');
const minify = require('cssnano');
const del = require('del');
const fancylog = require('fancy-log');
const gulp = require('gulp');
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const expectFile = require('gulp-expect-file');
const flatmap = require('gulp-flatmap');
const jshint = require('gulp-jshint');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const wait = require('gulp-wait');
const mergeStream = require('merge-stream');
const path = require('path');
const streamSwitch = require('stream-switch');
const through = require('through2');

/**
 * The font files to install
 * @type array
 */
const fontFilesInstall = [
    {
        src: [
            './node_modules/@fortawesome/fontawesome-free/webfonts/*.*'
        ],
        dest: './webroot/font'
    },
];

/**
 * Fonts to clean
 * @type array
 */
const fontsToClean = [
];

/**
 * Styles to process
 * @type Object
 */
const stylesToProcess = {
    app: [
        './node_modules/select2/dist/css/select2.min.css',
        './node_modules/select2/dist/css/select2.css',
        './node_modules/select2-bootstrap4-theme/dist/select2-bootstrap4.min.css',
        './node_modules/tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.css',
        './assets/app/scss/main.scss'
    ]
};

/**
 * Scripts to process
 * @type Object
 */
const scriptsToProcess = {
    app: [
        './node_modules/jquery/dist/jquery.js',
        './node_modules/popper.js/dist/umd/popper.js',
        './node_modules/bootstrap/dist/js/bootstrap.js',
        './node_modules/moment/min/moment.min.js',
        './node_modules/moment-timezone/builds/moment-timezone-with-data.min.js',
        './node_modules/jsrender/jsrender.js',
        './node_modules/tempusdominus-core/build/js/tempusdominus-core.js',
        './node_modules/tempusdominus-bootstrap-4/build/js/tempusdominus-bootstrap-4.js',
        './node_modules/select2/dist/js/select2.full.js',
        './node_modules/inputmask/dist/jquery.inputmask.js',
        './node_modules/jquery-countdown/dist/jquery.countdown.min.js',
        './node_modules/@fortawesome/fontawesome-free/js/all.min.js',
        './assets/app/js/*.js'
    ]
};

/**
 * Script to Lint
 * @type Object
 */
const scriptsToLint = {
    app: [
        './assets/app/js/*.js'
    ]
};

/**
 * CacheBuster Presets
 * @type Object
 */
const cb = {
    js: false,
    css: false
};

/**
 * OnError
 * @param object error The error
 */
function onError(error) {
    handleError.call(this, 'error', error);
}

/**
 * OnWarning
 * @param object warning The warning
 */
function onWarning(warning) {
    handleError.call(this, 'warning', warning);
}

/**
 * handleError
 * @param string level The error level error|warning
 * @param object error The error
 */
function handleError(level, error) {
    beep(1);
    fancylog.error(error.toString);
    if (level === 'error') {
        process.exit(1);
    }
    this.emit('end');
}

/**
 * Clean Fonts - Remove the fonts
 * @param Function done callback to signal completion
 */
function cleanFonts(done) {
    del.sync(fontsToClean);
    done();
}

/**
 * Install the specified fonts
 * @return stream The stream
 */
function installFonts() {
    return mergeStream(fontFilesInstall.map(function(config) {
        return gulp.src(config.src)
            .pipe(wait(1000))
            .pipe(plumber(onError))
            .pipe(gulp.dest(config.dest));
    }));
}

/**
 * Build Styles
 * @param Function done callback to signal completion
 * @return stream The stream
 */
function buildStyles(done) {
    var streams = [];
    for (var name in stylesToProcess) {
        streams.push(buildStyle(name, stylesToProcess[name]));
    }
    if (!streams) {
        done();
    }
    return mergeStream(streams);
}

/**
 * Build Style File
 * @param string name The name of the file
 * @param array files The files to process
 * @return stream The stream
 */
function buildStyle(name, files) {
    return gulp.src(files)
        .pipe(expectFile.real({verbose: true}, files.map(path.normalize)))
        .pipe(flatmap(function(stream, file) {
            if (file.extname === '.css') {
                return stream;
            }

            return stream
                .pipe(streamSwitch(function(file){
                    return file.extname;
                }, {
                    '.scss': sass()
                }))
                .pipe(plumber(onError));
        }))
        .pipe(concat(name + '.css'))
        .pipe(postcss([
            postcssImport(),
            prefix({
                cascade: true,
                remove: true
            })
        ]))
        .pipe(gulp.dest('./webroot/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCss({advanced: false}))
        .pipe(postcss([
            minify({
                discardComments: {
                    removeAll: true
                }
            })
        ]))
        .pipe(gulp.dest('./webroot/css'))
        .pipe(through.obj(function(file, enc, callback) {
            cb.css = true;
            callback(null, file);
        }));
}

/**
 * Build Scripts
 * @param Function done callback to signal completion
 * @return stream The stream
 */
function buildScripts(done) {
    var streams = [];
    for (var name in scriptsToProcess) {
        streams.push(buildScript(name, scriptsToProcess[name]));
    }
    if (!streams) {
        done();
    }
    return mergeStream(streams);
}

/**
 * Build Script File
 * @param string name The name of the file
 * @param array files The files to process
 * @return stream The stream
 */
function buildScript(name, files) {
    return gulp.src(files)
        .pipe(expectFile.real({verbose: true}, files.map(path.normalize)))
        .pipe(concat(name + '.js'))
        .pipe(gulp.dest('./webroot/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({compress: false}))
        .pipe(plumber(onError))
        .pipe(gulp.dest('./webroot/js'))
        .pipe(through.obj(function(file, enc, callback) {
            cb.js = true;
            callback(null, file);
        }));
}

/**
 * Lint the scripts
 * @param Function done callback to signal completion
 * @return stream The stream
 */
function lintScripts(done) {
    var streams = [];
    for (var name in scriptsToLint) {
        streams.push(lintFiles(name, scriptsToLint[name]));
    }
    if (!streams) {
        done();
    }

    return mergeStream(streams);
}

/**
 * Lint Script File
 * @param string name The name of the file
 * @param array files The files to lint
 * @return stream The stream
 */
function lintFiles(name, files) {
    return gulp.src(files)
        .pipe(expectFile.real({verbose: true}, files.map(path.normalize)))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
}

/**
 * CacheBuster
 * @param Function done callback to signal completion
 */
function cacheBuster(done) {
    if (cb.js || cb.css) {
        var config = gulp.src(['./config/app.php']);
        var time = Math.round(+new Date()/1000) + 60;
        if (cb.js) {
            config.pipe(replace(/'jsCB' => '(.*)',?\n/, "'jsCB' => '" + time + "',\n"));
        }
        if (cb.css) {
            config.pipe(replace(/'cssCB' => '(.*)',?\n/, "'cssCB' => '" + time + "',\n"))
        }
        config.pipe(gulp.dest('./config/'));
    }
    cb.js = false;
    cb.css = false;
    done();
}

/**
 * Watch the less
 * @param Function done callback to signal completion
 */
function watchSass(done) {
    gulp.watch('./assets/**/*.scss', { usePolling: true }, gulp.series(exports.styles, cacheBuster));
    done();
}

/**
 * Watch the scripts
 * @param Function done callback to signal completion
 */
function watchScript(done) {
    gulp.watch('./assets/**/*.js',  { usePolling: true }, gulp.series(exports.scripts, cacheBuster));
    done();
}

exports.default = gulp.series(lintScripts, gulp.parallel(gulp.series(cleanFonts, installFonts), buildScripts, buildStyles), cacheBuster);
exports.styles = gulp.series(buildStyles, cacheBuster);
exports.scripts = gulp.series(buildScripts, cacheBuster);
exports.fonts = gulp.series(cleanFonts, installFonts);
exports.watch = gulp.series(exports.default, gulp.parallel(watchSass, watchScript));
