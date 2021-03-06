var gulp = require('gulp'),
    es = require('event-stream'),
    pathsExports = require('../gulp-tasks/paths.js');

paths = pathsExports.getPaths();

exports.copyFonts = function(buildMode) {
  var extendFont = [paths.fonts.default];

  for (var i=0; i < paths.fonts.extend.length; i++) {
    extendFont.push(paths.fonts.extend[i]);
  }

  if (buildMode === 'dev') {
    return gulp
           .src(extendFont)
           .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts'))
           .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/fonts'))
           .pipe(gulp.dest(paths.build[buildMode] + '/fonts'));
  } else {
    return gulp
           .src(extendFont)
           .pipe(gulp.dest(paths.build[buildMode] + '/fonts'));
  }
}

exports.copySVG = function(buildMode) {
  var flagsSVGPaths = [],
      coinsSVGPaths = [];

  for (var i = 0; i < paths.svg.flags.length; i++) {
    flagsSVGPaths.push(paths.svg.default + '/' + paths.svg.size + '/' + paths.svg.flags[i] + '.svg');
  }

  for (var i = 0; i < paths.svg.coins.length; i++) {
    coinsSVGPaths.push(paths.svg.coinsPath + '/' + paths.svg.coins[i] + '.svg');
  }

  if (buildMode === 'dev') {
    return gulp
          .src(flagsSVGPaths)
          .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/svg/flags'))
          .pipe(gulp.dest(paths.build[buildMode] + '/css/fonts/fonts/svg/flags')),
          gulp
          .src(coinsSVGPaths)
          .pipe(gulp.dest(paths.build[buildMode] + '/css/dashboard/svg/coins'))
  } else {
    return gulp
           .src(flagsSVGPaths)
           .pipe(gulp.dest(paths.build[buildMode] + '/svg/flags')),
           gulp
           .src(coinsSVGPaths)
           .pipe(gulp.dest(paths.build[buildMode] + '/svg/coins'));
  }
}

exports.copyFontsESMerge = function(buildMode) {
  return es.merge(
           exports.copyFonts(buildMode),
           exports.copySVG(buildMode)
         );
}