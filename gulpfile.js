/*
 *  Iguana-GUI gulp build file
 *  Usage: gulp dev to build dev only verion
 *         gulp prod to build production version
 *         gulp zip to build prod and compress it into latest.zip
 */

 // TODO: add prod size evaluation print out

// dependencies
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    zip = require('gulp-zip'),
    es = require('event-stream'),
    runSequence = require('run-sequence'),
    // task files
    _exports = {
      js: require('./gulp-tasks/js-task.js'),
      html: require('./gulp-tasks/html-task.js'),
      css: require('./gulp-tasks/css-task.js'),
      chrome: require('./gulp-tasks/chrome-app'),
      font: require('./gulp-tasks/font-task.js'),
      clean: require('./gulp-tasks/clean-task.js'),
      paths: require('./gulp-tasks/paths.js')
    };

var buildMode,
    buildModeModifier,
    paths = _exports.paths.getPaths();

function compress() {
  return gulp
         .src(paths.build[buildMode] + '/**/*')
         .pipe(zip('latest.zip'))
         .pipe(gulp.dest(''));
}

gulp.task('devStyle', function() {
  return _exports.css.devInjectStyles(buildMode);
});

gulp.task('indexDev', function() {
  return _exports.html.indexHTML(buildMode, buildModeModifier);
});

gulp.task('index', function() {
  return _exports.html.indexHTML(buildMode, buildModeModifier);
});

gulp.task('scss', function() {
  return _exports.css.scss(buildMode);
});

gulp.task('scss:css', function() {
  return _exports.css.css(buildMode);
});

gulp.task('cssModifyCryptocoins', function() {
  return _exports.css.cssModifyCryptocoins(buildMode);
});

gulp.task('cssModifyProxima', function() {
  return _exports.css.cssModifyProxima(buildMode);
});

gulp.task('compress', function() {
  compress();
});

gulp.task('copyCoreJS', function() {
  return _exports.js.copyJS(buildMode);
});

gulp.task('copyBowerJS', function() {
  return _exports.js.copyBowerJS(buildMode);
});

gulp.task('compressJS', function() {
  return _exports.js.compressJS(buildMode, buildModeModifier);
});

gulp.task('copyFonts', function() {
  return _exports.font.copyFontsESMerge(buildMode);
});

gulp.task('cleanCSS', function() {
  return _exports.clean.cleanCSS(buildMode);
});

gulp.task('cleanJS', function() {
  return _exports.clean.cleanJS(buildMode);
});

gulp.task('cleanFonts', function() {
  return _exports.clean.cleanFonts(buildMode);
});

gulp.task('cleanIndex', function() {
  return _exports.clean.cleanIndex(buildMode);
});

gulp.task('cleanAllProd', function() {
  buildMode = 'prod';
  return _exports.clean.cleanAllProd(buildMode);
});

gulp.task('cleanProdOnEnd', function() {
  buildMode = 'prod';
  return _exports.clean.cleanProdOnEnd(buildMode);
});

gulp.task('copyProdConfigurableJS', function() {
  buildMode = 'prod';
  return _exports.js.copyProdConfigurableJS(buildMode);
});

gulp.task('copyResponsiveCSS', function() {
  buildMode = 'prod';
  return _exports.css.copyResponsiveCSS(buildMode);
});

gulp.task('cleanProdCompact', function() {
  buildMode = 'prod';
  return _exports.clean.cleanProdCompact(buildMode);
});

gulp.task('chromeApp', function() {
  buildMode = 'chrome';
  _exports.chrome.createChromeApp(buildMode, paths);
});

gulp.task('cleanChromeApp', function() {
  _exports.chrome.cleanChromeApp(paths.chrome['path']);
});

gulp.task('cleanAllDev', function() {
  buildMode = 'dev';
  return _exports.clean.cleanAllDev(buildMode);
});

gulp.task('default', function() {
  return gutil.log('Run gulp dev to build dev version or run gulp prod to build production version');
});

gulp.task('watch:dev', function() {
  gulp.watch(paths.partials, ['index']);
  gulp.watch(paths.js.default, ['copyCoreJS']);
  gulp.watch(paths.styles.default, ['scss']);
});

gulp.task('dev', function() {
  buildMode = 'dev';

  runSequence(
    'cleanAllDev',
    'copyCoreJS',
    'copyBowerJS',
    'scss:css',
    'cssModifyCryptocoins',
    'cssModifyProxima',
    'scss',
    'devStyle',
    'indexDev',
    'copyFonts',
    'watch:dev'
  );
});

gulp.task('prod', function(cb) {
  buildMode = 'prod';

  runSequence(
    'cleanAllProd',
    'copyBowerJS',
    'copyCoreJS',
    'compressJS',
    'copyFonts',
    'scss:css',
    'cssModifyCryptocoins',
    'cssModifyProxima',
    'scss',
    'cleanProdOnEnd',
    'copyProdConfigurableJS',
    'copyResponsiveCSS',
    'index',
    cb
  );
});

gulp.task('zip', function() {
  buildMode = 'prod';
  buildModeModifier = 'compact';

  runSequence(
    'prod',
    'cleanProdCompact',
    'compress'
  );
});