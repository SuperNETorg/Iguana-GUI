var gulp = require('gulp'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    replace = require('gulp-replace'),
    fs = require('fs'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    csslint = require('gulp-csslint'),
    csslintStylish = require('csslint-stylish'),
    pathsExports = require('../gulp-tasks/paths.js'),
    cssLintRulesExports = require('../gulp-tasks/css-lint-rules.js');

paths = pathsExports.getPaths();
cssLintRules = cssLintRulesExports.getCSSLintRules();
csslint.addFormatter('csslint-stylish');

exports.scss = function(buildMode) {
  if (buildMode === 'dev') {
    return gulp
           .src([
             paths.styles.default + '.scss',
             '!' + paths.styles.prodConcat
           ])
           .pipe(sass({
             style: 'expanded'
           }).on('error', sass.logError))
           .pipe(autoprefixer({
             browsers: ['last 5 versions', 'ios 7', 'android 4']
           }))
           .pipe(csslint(cssLintRules))
           .pipe(csslint.formatter('stylish'))
           .pipe(gulp.dest(paths.build[buildMode] + '/css'));
  } else {
    return gulp
           .src([paths.build[buildMode] + '/css/style.scss'])
           .pipe(sass().on('error', sass.logError))
           .pipe(autoprefixer({
             browsers: ['last 5 versions', 'ios 7', 'android 4']
           }))
           .pipe(cleanCSS({
             debug: true
           }, function(details) {
             console.log(details.name + ' original size : ' + details.stats.originalSize);
             console.log(details.name + ' minified size: ' + details.stats.minifiedSize);
           }))
           .pipe(gulp.dest(paths.build[buildMode]));
  }
}

exports.css = function(buildMode) {
  var extendCSS = [paths.styles.default + '.*'];

  for (var i=0; i < paths.styles.extend.length; i++) {
    extendCSS.push(paths.styles.extend[i]);
  }

  extendCSS.push(paths.proximaNova.path);

  if (buildMode === 'dev') {
    return gulp
           .src(extendCSS)
           .pipe(gulp.dest(paths.build[buildMode] + '/css'));
  } else {
    return gulp
           .src(extendCSS)
           .pipe(rename(function(path) {
              path.extname = '.scss';
           }))
           .pipe(gulp.dest(paths.build[buildMode] + '/css'));
  }
}

exports.copyResponsiveCSS = function(buildMode) {
  return gulp
         .src('sass/responsive/*.css')
         .pipe(cleanCSS({
           debug: true
         }, function(details) {
           console.log(details.name + ' original size : ' + details.stats.originalSize);
           console.log(details.name + ' minified size: ' + details.stats.minifiedSize);
         }))
         .pipe(gulp.dest(paths.build[buildMode] + '/css/responsive'));
}

exports.cssModifyCryptocoins = function(buildMode) {
  return gulp
         .src(paths.build[buildMode] + '/css/cryptocoins.' + (buildMode === 'dev' ? 'css' : 'scss'))
         .pipe(replace(/src:/, '/*src:')) // the below code is not efficient enough
         .pipe(replace(/font-weight:/, '*/\nsrc: url(\'fonts/cryptocoins.ttf?d2eit9\') format(\'truetype\');\nfont-weight:'))
         .pipe(gulp.dest(paths.build[buildMode] + '/css'));
}

exports.cssModifyProxima = function(buildMode) { // select only defined font variations, see paths.js
  content = fs.readFileSync(paths.build[buildMode] + '/css/proxima-nova.' + (buildMode === 'dev' ? 'css' : 'scss'), 'utf-8');

  var splitContent = content.split('@font-face {'),
      fontOutput = '';

  for (var i=0; i < splitContent.length; i++) {
    var fontStyleMatch = false,
        fontWeightMatch = false;

    for (var a=0; a < paths.proximaNova.style.length; a++) {
      if (splitContent[i].indexOf('font-style: ' + paths.proximaNova.style[a]) > -1) {
        fontStyleMatch = true;
      }
    }

    for (var a=0; a < paths.proximaNova.weight.length; a++) {
      if (splitContent[i].indexOf('font-weight: ' + paths.proximaNova.weight[a]) > -1) {
        fontWeightMatch = true;
      }
    }

    if (fontStyleMatch && fontWeightMatch) {
      fontOutput = fontOutput +
                    '@font-face {\n' +
                     'font-family: \"Proxima Nova\";\n' +
                     'font-style: ' + splitContent[i].match(/font-style: (.*);/)[1] + ';\n' +
                     'font-weight: ' + splitContent[i].match(/font-weight: (.*);/)[1] + ';\n' +
                     'src: ' + splitContent[i].match(/src: (.*);/)[1] + '\n}\n';
    }
  }

  return fs.writeFileSync(paths.build[buildMode] + '/css/proxima-nova.' + (buildMode === 'dev' ? 'css' : 'scss'), fontOutput, 'utf-8');
}

exports.devInjectStyles = function(buildMode) {
  return gulp
         .src(paths.styles.prodConcat)
         .pipe(replace('@import \'', '@import url(\'css/'))
         .pipe(replace('\';', '.css\');'))
         .pipe(gulp.dest(paths.build[buildMode] + '/css'));
}