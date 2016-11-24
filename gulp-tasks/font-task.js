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

exports.copyFonts = function(buildMode, paths) {
  if (buildMode === 'dev') {
    return
      gulp.src(paths.fonts)
          .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/fonts'));
  } else {
    return
      gulp.src(paths.fonts)
          .pipe(gulp.dest(paths.build[buildMode] + '/fonts'));
  }
}

exports.copySVG = function(buildMode, paths) {
  return
    gulp.src('fonts/svg/**/*')
        .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/svg'));
}

exports.copyFontsESMerge = function(buildMode, paths) {
  if (buildMode === 'dev') {
    return
      es.merge(
        fontExports._copyFonts(buildMode, paths),
        fontExports.copySVG(buildMode, paths)
      );
  } else {
    fontExports.copyFonts(buildMode, paths);
  }
}