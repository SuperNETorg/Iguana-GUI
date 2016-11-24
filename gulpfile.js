/*
 *  Iguana-GUI gulp build file
 *  Usage: gulp dev to build dev only verion
 *         gulp prod to build production version
 *         gulp zip to build prod and compress it into latest.zip
 */

// dependencies
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
    fs = require('fs'),
    // task files
    jsExports = require('./gulp-tasks/js-task.js'),
    htmlExports = require('./gulp-tasks/html-task.js'),
    cssExports = require('./gulp-tasks/css-task.js'),
    fontExports = require('./gulp-tasks/font-task.js'),
    cleanExports = require('./gulp-tasks/clean-task.js')
    pathsExports = require('./gulp-tasks/paths.js');

var buildMode,
    buildModeModifier,
    paths = pathsExports.getPaths();

function compress() {
  return
    gulp.src(paths.build[buildMode] + '/**/*')
        .pipe(zip('latest.zip'))
        .pipe(gulp.dest(''));
}

gulp.task('devStyle', ['cleanIndex'], function() {
  cssExports.devInjectStyles(buildMode, paths);
});

gulp.task('indexDev', ['devStyle'], function() {
  htmlExports.indexHTML(buildMode, buildModeModifier, paths);
});

gulp.task('index', ['cleanIndex'], function() {
  html.Exports.indexHTML(buildMode, buildModeModifier, paths);
});

gulp.task('scss', ['scss:css'], function() {
  cssExports.scss(buildMode, paths);
});

gulp.task('scss:css', function() {
  cssExports.css(buildMode, paths);
});

gulp.task('compress', function() {
  compress();
});

gulp.task('copyJS', ['cleanJS'], function() {
  jsExports.copyJS(buildMode, paths);
});

gulp.task('copyFonts', ['cleanFonts'], function() {
  fontExports.copyFontsESMerge(buildMode, paths);
});

gulp.task('cleanCSS', function() {
  cleanExports.cleanCSS(buildMode, paths);
});

gulp.task('cleanJS', function() {
  cleanExports.cleanJS(buildMode, paths);
});

gulp.task('cleanFonts', function() {
  cleanExports.cleanFonts(buildMode, paths);
});

gulp.task('cleanIndex', function() {
  cleanExports.cleanIndex(buildMode, paths);
});

gulp.task('cleanAllProd', function() {
  buildMode = 'prod';
  cleanExports.cleanAllProd(buildMode, paths);
});

gulp.task('cleanProdCompact', ['prod-compact-index'], function() {
  buildMode = 'prod';
  cleanExports.cleanProdCompact(buildMode, paths);
});

gulp.task('cleanAllDev', function() {
  buildMode = 'dev';
  cleanExports.cleanAllDev(buildMode, paths);
});

gulp.task('default', function() {
  return gutil.log('Run gulp dev to build dev version or run gulp prod to build production version');
});

gulp.task('watch:dev', function() {
  gulp.watch(paths.partials, ['index']);
  gulp.watch(paths.js, ['copyJS']);
  gulp.watch(paths.styles, ['scss']);
});

gulp.task('dev', ['cleanAllDev'], function() {
  buildMode = 'dev';
  gulp.start(
    'copyJS',
    'scss',
    'indexDev',
    'copyFonts',
    'watch:dev'
  );
});

gulp.task('prodAssets', ['cleanAllProd'], function () {
  buildMode = 'prod';

  return
    es.merge(
      fontExports.copyFonts(buildMode, paths),
      cssExports.css(buildMode, paths),
      cssExports.scss(buildMode, paths),
      jsExports.copyJS(buildMode, paths),
      jsExports.copyProdConfigurableJS(buildMode, paths)
    );
});

gulp.task('prod', ['prodAssets'], function () {
  buildMode = 'prod';
  gulp.start('index');
});

gulp.task('prod-compact-index', ['prodAssets'], function () {
  buildMode = 'prod';
  buildModeModifier = 'compact';
  gulp.start('index');
});

gulp.task('prod-compact', ['cleanProdCompact']);

gulp.task('zip', ['prod-compact'], function() {
  compress();
});

gulp.task('clean:dev', function() {
  buildMode = 'dev';
  gulp.start('cleanAll');
});