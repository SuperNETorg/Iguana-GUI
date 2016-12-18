var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    fs = require('fs'),
    jscs = require('gulp-jscs'), // rules ref: http://jscs.info/rules
    pathsExports = require('../gulp-tasks/paths.js');

function initJSIncludesArray(buildMode) {
  var splitData,
      content = fs.readFileSync('jsIncludes.js', 'utf-8');

  paths = pathsExports.getPaths(buildMode === 'dev' ? true : false);

  splitData = content.split('</script>');
  splitData.pop();

  for (var i=0; i < splitData.length; i++) {
    var isBower = splitData[i].indexOf('omit=') > -1 ? true : false;

    if (splitData[i].indexOf(paths.configurable.js[0]) === -1 &&
        splitData[i].indexOf(paths.configurable.js[1]) === -1 &&
        splitData[i].indexOf(paths.omit[buildMode].js[0]) === -1 &&
        splitData[i].indexOf(buildMode === 'dev' ? 'omit=' : 'null') === -1) {
      splitData[i] = splitData[i].replace('\n<script type="text/javascript" src="', '')
                                 .replace(/<!--.*-->/, '')
                                 .replace('\n', '')
                                 .replace('">', '')
                                 .replace('" omit="true', '');
      if (isBower && buildMode !== 'dev') {
        splitData[i] = paths.build[buildMode] + '/' + splitData[i];
        splitData[i] = splitData[i].replace('.js', '.min.js');
      } else {
        splitData[i] = paths.build[buildMode] + '/' + splitData[i];
      }
    } else {
      delete splitData[i];
    }
  }

  splitData = splitData.filter(function(item) {
    if (item !== undefined) {
      return item;
    }
  });

  return splitData;
}

exports.copyJS = function(buildMode) {
  paths = pathsExports.getPaths(buildMode === 'dev' ? true : false);

  return gulp
         .src([paths.js.default])
         .pipe(jscs())
         .pipe(jscs.reporter())
         .pipe(gulp.dest(paths.build[buildMode] + '/js'));
}

exports.copyBowerJS = function(buildMode) {
  paths = pathsExports.getPaths(buildMode === 'dev' ? true : false);

  return gulp
         .src(paths.js.extend)
         .pipe(gulp.dest(paths.build[buildMode] + '/js'));
}

exports.compressJS = function(buildMode, buildModeModifier) {
  paths = pathsExports.getPaths(buildMode === 'dev' ? true : false);

  var jsIncludesArray = initJSIncludesArray(buildMode);

  if (buildModeModifier) {
    return gulp
           .src(jsIncludesArray)
           .pipe(concat('all.js'))
           .pipe(uglify({
             mangle: false
           }))
           .pipe(gulp.dest(paths.build[buildMode]));
  } else {
    return gulp
           .src(jsIncludesArray)
           .pipe(concat('all.js'))
           .pipe(gulp.dest(paths.build[buildMode]));
  }
}

exports.copyProdConfigurableJS = function(buildMode) {
  return gulp
         .src(paths.configurable.js)
         .pipe(gulp.dest(paths.build[buildMode] + '/js'));
}