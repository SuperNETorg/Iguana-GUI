var gulp = require('gulp'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip'),
    fs = require('fs'),
    runSequence = require('run-sequence');

exports.createChromeApp = function(buildMode, paths) {
  runSequence('prod', function () {
    exports.copyAllFiles(paths.chrome.prodPath, paths);
  });
};

exports.changeBackgroundAddress = function(paths) {
  return gulp
    .src(paths['chrome'].path+'/style.css')
    .pipe(replace('../images/bg.png', 'images/bg.png'))
    .pipe(gulp.dest(paths['chrome'].path+'/'));
};

exports.copyAllFiles = function(buildMode, paths) {
  var stream =
      gulp
        .src(__dirname + '/../' + buildMode)
        .pipe(gulp.dest(__dirname + '/../' + paths.chrome.path));
  stream.on('end',function() {
    exports.changeBackgroundAddress(paths);
    exports.zipChromeApps('chrome-app','chrome-app');
  });
};

exports.zipChromeApps = function(path, zipName) {
  return gulp
    .src(path + '/**/*')
    .pipe(zip(zipName+'.zip'))
    .pipe(gulp.dest(''));
};

exports.cleanChromeApp = function(buildMode) {
  return gulp.src(buildMode, {read: false}).pipe(rimraf());
};