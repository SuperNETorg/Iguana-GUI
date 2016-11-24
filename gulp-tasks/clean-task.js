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

exports.cleanCSS = function(buildMode, paths) {
  return
    gulp.src(paths.build[buildMode] + '/css/*', {
      read: false
    })
    .pipe(rimraf());
}

exports.cleanJS = function(buildMode, paths) {
  return
    gulp.src(paths.build[buildMode] + '/js/*', {
      read: false
    })
    .pipe(rimraf());
}

exports.cleanFonts = function(buildMode, paths) {
  return
    gulp.src(paths.build[buildMode] + '/fonts/*', {
      read: false
    })
    .pipe(rimraf());
}

exports.cleanIndex = function(buildMode, paths) {
  return
    gulp.src(paths.build[buildMode] + '/index.html', {
      read: false
    })
    .pipe(rimraf());
}

exports.cleanAllProd = function(buildMode, paths) {
  return
    gulp.src(paths.build[buildMode], {
      read: false
    })
    .pipe(rimraf());
}

exports.cleanProdCompact = function(buildMode, paths) {
  return
    gulp.src([
              paths.build[buildMode] + '/css',
              paths.build[buildMode] + '/all.js',
              paths.build[buildMode] + '/style.css'
            ],{
              read: false
        })
        .pipe(rimraf());
}

exports.cleanAllDev = function(buildMode, paths) {
  return
    gulp.src(paths.build[buildMode], {
      read: false
    })
   .pipe(rimraf());
}