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

exports.scss = function(buildMode, paths) {
  if (buildMode === 'dev') {
    return
      gulp.src(['sass/**/*.scss', '!sass/style.scss'])
          .pipe(sass({
            style: 'expanded'
          }).on('error', sass.logError))
          .pipe(gulp.dest(paths.build[buildMode] + '/css'));
  } else {
    return
      gulp.src('sass/style.scss')
          .pipe(sass().on('error', sass.logError))
          .pipe(cleanCSS({
            debug: true
          }, function(details) {
            console.log(details.name + ' original size : ' + details.stats.originalSize);
            console.log(details.name + ' minified size: ' + details.stats.minifiedSize);
          }))
          .pipe(gulp.dest(paths.build[buildMode]));
  }
}

exports.css = function(buildMode, paths) {
  if (buildMode === 'dev') {
    return
      gulp.src(paths.styles + '.css')
          .pipe(gulp.dest(paths.build[buildMode] + '/css'));
  } else {
    return
      gulp.src(paths.styles + '.css')
          .pipe(cleanCSS({
            debug: true
          }, function(details) {
            console.log(details.name + ' original size: ' + details.stats.originalSize);
            console.log(details.name + ' minified size: ' + details.stats.minifiedSize);
          }))
          .pipe(gulp.dest(paths.build[buildMode] + '/css'));
  }
}

exports.devInjectStyles = function(buildMode, paths) {
  return
    gulp.src('sass/style.scss')
        .pipe(replace('@import \'', '@import url(\'css/'))
        .pipe(replace('\';', '.css\');'))
        .pipe(gulp.dest(paths.build[buildMode] + '/css'));
}