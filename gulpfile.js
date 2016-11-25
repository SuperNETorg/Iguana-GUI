/*
 *  Iguana-GUI gulp build file
 *  Usage: gulp dev to build dev only verion
 *         gulp prod to build production version
 *         gulp zip to build prod and compress it into latest.zip
 */

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

gulp.task('compress', function() {
  compress();
});

gulp.task('copyJS', function() {
  return _exports.js.copyJS(buildMode);
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

gulp.task('cleanProdCompact', function() {
  buildMode = 'prod';
  return _exports.clean.cleanProdCompact(buildMode);
});

gulp.task('chromeApp', function() {
  buildMode = 'chrome';
  chromeApp.createChromeApp(buildMode, paths);
});

gulp.task('cleanChromeApp', function() {
  chromeApp.cleanChromeApp(paths.chrome['path']);
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
  gulp.watch(paths.js, ['copyJS']);
  gulp.watch(paths.styles, ['scss']);
});

gulp.task('dev', function() {
  buildMode = 'dev';

  runSequence(
    'cleanAllDev',
    'copyJS',
    'scss:css',
    'scss',
    'devStyle',
    'indexDev',
    'copyFonts',
    'watch:dev'
  );
});

gulp.task('prodAssets', function() {
  buildMode = 'prod';

  return es.merge(
           _exports.font.copyFonts(buildMode),
           _exports.css.css(buildMode),
           _exports.css.scss(buildMode),
           _exports.js.copyJS(buildMode),
           _exports.js.copyProdConfigurableJS(buildMode)
         );
});

gulp.task('prod', function() {
  buildMode = 'prod';

  runSequence(
    'cleanAllProd',
    'prodAssets',
    'index'
  );
});

gulp.task('zip', function() {
  buildMode = 'prod';
  buildModeModifier = 'compact';

  runSequence(
    'prodAssets',
    'index',
    'cleanProdCompact',
    'compress'
  );
});

gulp.task('clean:dev', function() {
  buildMode = 'dev';
  gulp.start('cleanAll');
});