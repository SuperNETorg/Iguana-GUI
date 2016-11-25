var gulp = require('gulp'),
    injectPartials = require('gulp-inject-partials'),
    rimraf = require('gulp-rimraf'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip'),
    es = require('event-stream'),
    fs = require('fs');

  /*fontExports = require('font-task'),
  cssExports = require('css-task'),
  jsExports = require('js-task');*/

exports.createChromeApp = function(buildMode, paths) {
  return es.merge(
    this.copyFontsChrome(buildMode, paths),
    this.cssChrome(buildMode, paths),
    this.chromeCopyJS(buildMode, paths),
    this.chromeCopyProdConfigurableJS(buildMode, paths),
    this.allChromeFiles(paths),
    this.chromeIndexHTML(buildMode, 'compacts', paths)
  );
};

exports.allChromeFiles = function(paths) {
  return gulp.src(['./partials/**/*' ]).pipe(gulp.dest(paths.chrome['path'] + '/partials'));
};

exports.cleanChromeApp = function(buildMode) {
  return gulp.src(buildMode, {read: false}).pipe(rimraf());
};

exports.copyFontsChrome = function(buildMode, paths) {
  return gulp.src(paths.fonts).pipe(gulp.dest(paths.chrome['path'] + '/fonts'));
};

exports.cssChrome = function(buildMode, paths) {
  return gulp.src(paths.styles + '.css')
    .pipe(gulp.dest(paths.chrome['path'] + '/css'));
};

exports.scssChrome = function(buildMode, paths) {
  return gulp.src('sass/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({
      debug: true
    }, function(details) {
      console.log(details.name + ' original size : ' + details.stats.originalSize);
      console.log(details.name + ' minified size: ' + details.stats.minifiedSize);
    }))
    .pipe(gulp.dest(paths.build[buildMode]));
};

exports.chromeCopyJS = function(buildMode, paths) {
    return gulp.src(paths.js)
      .pipe(gulp.dest(paths.chrome['path'] + '/js'));
};

exports.chromeCopyProdConfigurableJS = function(buildMode, paths) {
  return gulp.src(paths.configurable.js).pipe(gulp.dest(paths.chrome['path'] + '/js'));
};

exports.chromeIndexHTML = function(buildMode, buildModeModifier, paths) {
  var prodInsertCSS,
    prodInsertJS;

  if (buildModeModifier === 'compact') {
    prodInsertJS = '<script type="text/javascript" src="app/js/settings.js"></script>' +
      '<script type="text/javascript" src="app/js/supported-coins-list.js"></script>' +
      '<script type="text/javascript">' +
      '<!-- partial:' + paths.build[buildMode] + '/all.js --><!-- partial -->' +
      '</script>';
    prodInsertCSS = '<style>' +
      '<!-- partial:' + paths.build[buildMode] + '/style.css --><!-- partial -->' +
      '<!-- partial:' + paths.build[buildMode] + '/app/css/responsive/auth.css --><!-- partial -->' +
      '<!-- partial:' + paths.build[buildMode] + '/app/css/responsive/dashboard.css --><!-- partial -->' +
      '</style>';
  } else {
    prodInsertJS = '<script type="text/javascript" src="app/js/settings.js"></script>' +
      '<script type="text/javascript" src="app/js/supported-coins-list.js"></script>' +
      '<script type="text/javascript" src="app/all.js"></script>';
    prodInsertCSS = '<link rel="stylesheet" href="app/style.css">\n' +
      '<link rel="stylesheet" href="app/css/responsive/auth.css">\n' +
      '<link rel="stylesheet" href="app/css/responsive/dashboard.css">\n';
  }

  return gulp.src('index.html')
    .pipe(replace('<!-- partial:insertJS --><!-- partial -->', buildMode === 'dev' ? '<!-- partial:jsIncludes.js --><!-- partial -->' : prodInsertJS))
    .pipe(replace('<style><!-- partial:insertCSS --><!-- partial --></style>',
      buildMode === 'dev' ? '<style>\n<!-- partial:' + paths.build[buildMode] + '/app/css/style.scss --><!-- partial -->\n</style><link rel="stylesheet" href="app/css/responsive/auth.css"><link rel="stylesheet" href="app/css/responsive/dashboard.css">' : prodInsertCSS))
    .pipe(injectPartials({
      removeTags: true
    }))
    .pipe(gulp.dest(paths.build[buildMode]));
};

exports.changeFunction =function(text,changeText, filePath) {
  gulp.src([filePath])
    .pipe(replace(text, changeText))
    .pipe(gulp.dest(filePath));
};