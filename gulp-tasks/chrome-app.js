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
  var path= 'chrome-app/app',
      buildMode= 'compiled/prod/**/*';

  runSequence('prod', function (path,buildMode) {
    exports.copyAllFiles(buildMode, paths);
  });
};

exports.copyAllFiles = function() {
  var path= 'chrome-app/app',
    buildMode= 'compiled/prod/**/*';

  gulp.src(__dirname + '/../' + buildMode)
      .pipe(gulp.dest(__dirname + '/../' + path));
}

exports.cleanChromeApp = function(buildMode) {
  return gulp.src(buildMode, {read: false}).pipe(rimraf());
};