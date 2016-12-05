var gulp = require('gulp'),
    image = require('gulp-image'),
    paths = require('../gulp-tasks/paths.js').getPaths(),
    buildPaths;

exports.copyImages = function (buildMode) {
  buildPaths = paths.build[buildMode ? buildMode : 'dev'];
  return gulp.src(paths.image.default + '/*')
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: true,
      gifsicle: true,
      svgo: true,
      concurrent: 10
    }))
    .pipe(gulp.dest(buildPaths + '/' + paths.image.default));
};