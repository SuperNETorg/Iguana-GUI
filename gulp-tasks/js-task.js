var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    fs = require('fs'),
    pathsExports = require('../gulp-tasks/paths.js');

paths = pathsExports.getPaths();

function initJSIncludesArray(buildMode) {
  var splitData,
      content = fs.readFileSync('jsIncludes.js', 'utf-8');

  splitData = content.split('</script>');
  splitData.pop();

  for (var i=0; i < splitData.length; i++) {
    if (splitData[i].indexOf(paths.configurable.js[0]) === -1 &&
        splitData[i].indexOf(paths.configurable.js[1]) === -1 &&
        splitData[i].indexOf(paths.omit[buildMode].js[0]) === -1) {
      splitData[i] = splitData[i].replace('\n<script type="text/javascript" src="', '')
                                 .replace(/<!--.*-->/, '')
                                 .replace('\n', '')
                                 .replace('">', '');
    } else {
      delete splitData[i];
    }
  }

  splitData.filter(function(item) {
    return item != undefined;
  }).join();

  return splitData;
}

exports.copyJS = function(buildMode) {
  if (buildMode === 'dev') {
    return gulp
           .src(paths.js)
           .pipe(gulp.dest(paths.build[buildMode] + '/js'));
  } else {
    var jsIncludesArray = initJSIncludesArray(buildMode);

    return gulp
           .src(jsIncludesArray)
           .pipe(concat('all.js'))
           .pipe(uglify({
             mangle: false
           }))
           .pipe(gulp.dest(paths.build[buildMode]));
  }
}

exports.copyProdConfigurableJS = function(buildMode) {
  return gulp
         .src(paths.configurable.js)
         .pipe(gulp.dest(paths.build[buildMode] + '/js'));
}