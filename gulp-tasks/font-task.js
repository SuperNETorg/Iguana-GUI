var gulp = require('gulp'),
    es = require('event-stream'),
    pathsExports = require('../gulp-tasks/paths.js');

paths = pathsExports.getPaths();

exports.copyFonts = function(buildMode) {
  if (buildMode === 'dev') {
    return gulp
           .src(paths.fonts)
           .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/fonts'));
  } else {
    return gulp
           .src(paths.fonts)
           .pipe(gulp.dest(paths.build[buildMode] + '/fonts'));
  }
}

exports.copySVG = function(buildMode) {
  return gulp
         .src('fonts/svg/**/*')
         .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/svg'));
}

exports.copyFontsESMerge = function(buildMode) {
  if (buildMode === 'dev') {
    return es.merge(
             exports.copyFonts(buildMode),
             exports.copySVG(buildMode)
           );
  } else {
    exports.copyFonts(buildMode);
  }
}