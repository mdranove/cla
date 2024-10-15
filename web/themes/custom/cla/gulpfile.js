const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const $ = require('gulp-load-plugins')();
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssInlineSvg = require('postcss-inline-svg');
const browserSync = require('browser-sync').create();
const pxtorem = require('postcss-pxtorem');

const postcssProcessors = [
  postcssInlineSvg({
    removeFill: true,
    paths: ['./node_modules/bootstrap-icons/icons'],
  }),
  pxtorem({
    propList: [
      'font',
      'font-size',
      'line-height',
      'letter-spacing',
      '*margin*',
      '*padding*',
    ],
    mediaQuery: true,
  }),
];

const paths = {
  scss: {
    src: './scss/style.scss',
    dest: './css',
    watch: './scss/**/*.scss',
    bootstrap: './node_modules/bootstrap/scss/bootstrap.scss',
  },
  js: {
    bootstrap: './node_modules/bootstrap/dist/js/bootstrap.min.js',
    popper: './node_modules/@popperjs/core/dist/umd/popper.min.js',
    base: '../../contrib/bootstrap/js/base.js',
    dest: './js',
  },
};

// Compile sass into CSS & auto-inject into browsers
function styles() {
  return gulp
    .src([paths.scss.bootstrap, paths.scss.src])
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: [
          './node_modules/bootstrap/scss',
          '../../contrib/bootstrap/scss',
        ],
      }).on('error', sass.logError)
    )
    .pipe($.postcss(postcssProcessors))
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: [
            'Chrome >= 35',
            'Firefox >= 38',
            'Edge >= 12',
            'Explorer >= 10',
            'iOS >= 8',
            'Safari >= 8',
            'Android 2.3',
            'Android >= 4',
            'Opera >= 12',
          ],
        }),
      ])
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// Move the javascript files into our js folder
function js() {
  return gulp
    .src([paths.js.bootstrap, paths.js.popper, paths.js.base])
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// Build task combining styles and js
const build = gulp.series(styles, gulp.parallel(js, serve));

// Export tasks
exports.styles = styles;
exports.js = js;
exports.serve = serve;
exports.build = build;

exports.default = build;
