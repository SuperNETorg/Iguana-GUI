var gulp = require('gulp'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip'),
    fs = require('fs'),
    exec = require('child_process').exec,
    runSequence = require('run-sequence');

exports.createChromeApp = function(buildMode, paths, packCRX) {
  exports.cleanChromeApp();
  runSequence('prod', function() {
    exports.copyAllFiles(paths.chrome.prodPath, paths, packCRX);
    exports.copyChromeAppConfig(paths);
  });
};

exports.changeBackgroundAddress = function(paths) {
  return gulp
    .src(paths.chrome.path + '/style.css')
    .pipe(replace('../images/bg.png', 'images/bg.png'))
    .pipe(gulp.dest(paths.chrome.path + '/'));
};

exports.copyAllFiles = function(buildMode, paths, packCRX) {
  var stream =
      gulp
        .src(__dirname + '/../' + buildMode)
        .pipe(gulp.dest(__dirname + '/../' + paths.chrome.path));
  stream.on('end', function() {
    var backgroundAddress = exports.changeBackgroundAddress(paths);
    backgroundAddress.on('end', function() {
      exports.zipChromeApps(paths, 'chrome-app');
      if (packCRX) exports.createCRX(paths);
    });
  });
};

exports.copyChromeAppConfig = function(paths) {
  return gulp
         .src(paths.chrome.config + '/*')
         .pipe(gulp.dest(paths.chrome.configProd));
};

exports.zipChromeApps = function(path, zipName) {
  return gulp
    .src(paths.chrome.configProd + '/**/*')
    .pipe(zip(zipName + '.zip'))
    .pipe(gulp.dest(''));
};

exports.cleanChromeApp = function() {
  return gulp.src(paths.chrome.configProd, {
                read: false
              })
              .pipe(rimraf());
};

exports.createCRX = function(paths) {
  exec('./create_crx.sh compiled/chrome-app chrome-app-dev.pem', function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);

    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};