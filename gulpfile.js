const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const gulp = require('gulp');
const concat = require('gulp-concat');
const expectFile = require('gulp-expect-file');
const jshint = require('gulp-jshint');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const gulpSass = require('gulp-sass');
const sass = require('sass');
const terser = require('gulp-terser');
const mergeStream = require('merge-stream');
const path = require('path');

const compileSass = gulpSass(sass);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const fontFiles = [
    { src: './node_modules/@fortawesome/fontawesome-free/webfonts/*.*', dest: './webroot/font' },
];

const styles = {
    app: [
        './node_modules/@fortawesome/fontawesome-free/css/all.min.css',
        './node_modules/tom-select/dist/css/tom-select.bootstrap5.min.css',
        './assets/app/scss/main.scss',
    ],
};

const scripts = {
    app: [
        './node_modules/@popperjs/core/dist/umd/popper.js',
        './node_modules/bootstrap/dist/js/bootstrap.js',
        './node_modules/inputmask/dist/inputmask.js',
        './node_modules/tom-select/dist/js/tom-select.complete.js',
        './assets/app/js/*.js',
    ],
};

const lint = {
    app: ['./assets/app/js/*.js'],
};

// Track whether CSS or JS changed for cache busting
let builtCss = false;
let builtJs = false;

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

function installFonts() {
    return mergeStream(fontFiles.map(({ src, dest }) =>
        gulp.src(src, { encoding: false }).pipe(gulp.dest(dest))
    ));
}

function buildStyle(name, files) {
    const normalized = files.map(path.normalize);

    return gulp.src(files)
        .pipe(expectFile.real({ verbose: true }, normalized))
        .pipe(compileSass({silenceDeprecations: ['legacy-js-api', 'import', 'if-function', 'global-builtin', 'color-functions']}).on('error', compileSass.logError))
        .pipe(concat(name + '.css'))
        .pipe(replace('../webfonts/', '../font/'))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('./webroot/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss([cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })]))
        .pipe(gulp.dest('./webroot/css'));
}

function buildStyles(done) {
    const streams = Object.entries(styles).map(([name, files]) => buildStyle(name, files));
    if (streams.length === 0) return done();
    builtCss = true;
    return mergeStream(streams);
}

function buildScript(name, files) {
    const normalized = files.map(path.normalize);

    return gulp.src(files)
        .pipe(expectFile.real({ verbose: true }, normalized))
        .pipe(concat(name + '.js'))
        .pipe(gulp.dest('./webroot/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(terser({ compress: false }))
        .pipe(gulp.dest('./webroot/js'));
}

function buildScripts(done) {
    const streams = Object.entries(scripts).map(([name, files]) => buildScript(name, files));
    if (streams.length === 0) return done();
    builtJs = true;
    return mergeStream(streams);
}

function lintScripts(done) {
    const streams = Object.entries(lint).map(([, files]) =>
        gulp.src(files)
            .pipe(expectFile.real({ verbose: true }, files.map(path.normalize)))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'))
    );
    if (streams.length === 0) return done();
    return mergeStream(streams);
}

async function lintStyles() {
    const scssFiles = Object.values(styles)
        .flat()
        .filter(f => f.endsWith('.scss'));
    if (scssFiles.length === 0) return;

    const stylelint = await import('stylelint');
    const result = await stylelint.default.lint({
        files: scssFiles,
        formatter: 'string',
    });

    if (result.output) {
        process.stderr.write(result.output);
    }
    if (result.errored) {
        throw new Error('stylelint found errors');
    }
}

function cacheBuster(done) {
    if (!builtJs && !builtCss) return done();

    const time = Math.round(Date.now() / 1000) + 60;
    let stream = gulp.src('./config/app.php');

    if (builtJs)  stream = stream.pipe(replace(/'jsCB' => '(.*)',?\n/,  `'jsCB' => '${time}',\n`));
    if (builtCss) stream = stream.pipe(replace(/'cssCB' => '(.*)',?\n/, `'cssCB' => '${time}',\n`));

    builtJs = false;
    builtCss = false;
    return stream.pipe(gulp.dest('./config/'));
}

function watchStyles(done) {
    gulp.watch('./assets/**/*.scss', { usePolling: true }, gulp.series(buildStyles, cacheBuster));
    done();
}

function watchScripts(done) {
    gulp.watch('./assets/**/*.js', { usePolling: true }, gulp.series(lintScripts, buildScripts, cacheBuster));
    done();
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

exports.default = gulp.series(
    gulp.parallel(lintScripts, lintStyles),
    gulp.parallel(installFonts, buildScripts, buildStyles),
    cacheBuster
);
exports.lint    = gulp.parallel(lintScripts, lintStyles);
exports.styles  = gulp.series(buildStyles, cacheBuster);
exports.scripts = gulp.series(lintScripts, buildScripts, cacheBuster);
exports.fonts   = installFonts;
exports.watch   = gulp.series(exports.default, gulp.parallel(watchStyles, watchScripts));
