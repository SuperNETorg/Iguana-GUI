var gulp = require('gulp'),
    injectPartials = require('gulp-inject-partials'),
    del = require('del'),
    rimraf = require('gulp-rimraf');
    gutil = require('gulp-util'),
    sass = require('gulp-sass');

var paths = {
  partials: 'partials/**/*.html',
  styles: 'sass/**/*',
  js: 'js/**/*.js',
  fonts: 'fonts/**/*',
  devBuild: 'compiled/dev',
  prodBuild: 'compiled/prod'
};

gulp.task('index', ['cleanIndex'], function() {
  return gulp.src('index.html')
             .pipe(injectPartials())
             .pipe(gulp.dest('compiled/dev'));
});

gulp.task('copyJS', ['cleanJS'], function() {
  return gulp.src(paths.js)
             .pipe(gulp.dest(paths.devBuild + '/js'));
});

gulp.task('scss', ['scss:css'], function() {
  return gulp.src('sass/style.scss')
             .pipe(sass().on('error', sass.logError))
             .pipe(gulp.dest(paths.devBuild));
});

gulp.task('scss:css', function() {
  return gulp.src(paths.styles + '.css')
             .pipe(gulp.dest(paths.devBuild + '/css'));
});

gulp.task('copyFonts', ['cleanFonts'], function() {
  return gulp.src(paths.fonts)
             .pipe(gulp.dest(paths.devBuild + '/fonts'));
});

gulp.task('cleanCSS', function() {
  return gulp.src(paths.devBuild + '/css/*', { read: false })
             .pipe(rimraf());
});

gulp.task('cleanJS', function() {
  return gulp.src(paths.devBuild + '/js/*', { read: false })
             .pipe(rimraf());
});

gulp.task('cleanFonts', function() {
  return gulp.src(paths.devBuild + '/fonts/*', { read: false })
             .pipe(rimraf());
});

gulp.task('cleanIndex', function() {
  return gulp.src(paths.devBuild + '/index.html', { read: false })
             .pipe(rimraf());
});

gulp.task('default', function() {
  return gutil.log('Run gulp dev to build dev version');
});

gulp.task('watch:dev', function() {
  gulp.watch(paths.partials, ['index']);
  gulp.watch(paths.js, ['copyJS']);
  gulp.watch(paths.styles, ['scss']);
});

gulp.task('dev', ['cleanCSS', 'index', 'copyFonts', 'copyJS', 'scss', 'watch:dev']);