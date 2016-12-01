var gulp = require('gulp'),
    injectPartials = require('gulp-inject-partials'),
    replace = require('gulp-replace'),
    pathsExports = require('../gulp-tasks/paths.js');

paths = pathsExports.getPaths();

exports.indexHTML = function(buildMode, buildModeModifier) {
  var prodInsertCSS,
      prodInsertJS;

  if (buildModeModifier === 'compact') {
    prodInsertJS = '<script type="text/javascript" src="js/settings.js"></script>' +
                   '<script type="text/javascript" src="js/supported-coins-list.js"></script>' +
                   '<script type="text/javascript">' +
                     '<!-- partial:' + paths.build[buildMode] + '/all.js --><!-- partial -->' +
                   '</script>';
    prodInsertCSS = '<style>' +
                      '<!-- partial:' + paths.build[buildMode] + '/style.css --><!-- partial -->' +
                      '<!-- partial:' + paths.build[buildMode] + '/css/responsive/auth.css --><!-- partial -->' +
                      '<!-- partial:' + paths.build[buildMode] + '/css/responsive/dashboard.css --><!-- partial -->' +
                    '</style>';
  } else {
    prodInsertJS = '<script type="text/javascript" src="js/settings.js"></script>' +
                   '<script type="text/javascript" src="js/supported-coins-list.js"></script>' +
                   '<script type="text/javascript" src="all.js"></script>';
    prodInsertCSS = '<link rel="stylesheet" href="style.css">\n' +
                    '<link rel="stylesheet" href="css/responsive/auth.css">\n' +
                    '<link rel="stylesheet" href="css/responsive/dashboard.css">\n';
  }

  return gulp
         .src('index.html')
         .pipe(replace('<!-- partial:insertJS --><!-- partial -->', buildMode === 'dev' ? '<!-- partial:jsIncludes.js --><!-- partial -->' : prodInsertJS))
         .pipe(replace('<style>' +
                         '<!-- partial:insertCSS --><!-- partial -->' +
                       '</style>',
                       buildMode === 'dev' ?
                       '<style>\n' +
                         '<!-- partial:' + paths.build[buildMode] + '/css/style.scss --><!-- partial -->\n' +
                       '</style>' +
                       '<link rel="stylesheet" href="css/responsive/dashboard.css">' : prodInsertCSS))
         .pipe(injectPartials({
           removeTags: true
         }))
         .pipe(gulp.dest(paths.build[buildMode]));
}