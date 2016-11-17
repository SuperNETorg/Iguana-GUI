var gulp = require('gulp'),
    injectPartials = require('gulp-inject-partials'),
    del = require('del'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass');

gulp.task('index', ['cleanIndex'], function() {
  return gulp.src('index.html')
             .pipe(injectPartials())
             .pipe(gulp.dest('compiled/dev'));
});

gulp.task('copyJS', ['cleanJS'], function() {
  return gulp.src(['js/**/*'])
             .pipe(gulp.dest('compiled/dev/js'));
});

gulp.task('scss', ['scss:css'], function() {
  return gulp.src('sass/style.scss')
             .pipe(sass().on('error', sass.logError))
             .pipe(gulp.dest('compiled/dev/'));
});

gulp.task('scss:css', function() {
  return gulp.src('sass/**/*.css')
             .pipe(gulp.dest('compiled/dev/css'));
});

gulp.task('copyFonts', ['cleanFonts'], function() {
  return gulp.src(['fonts/**/*'])
             .pipe(gulp.dest('compiled/dev/fonts'));
});

gulp.task('cleanCSS', function() {
  return del(['compiled/dev/css']);
});

gulp.task('cleanJS', function() {
  return del(['compiled/dev/js']);
});

gulp.task('cleanFonts', function() {
  return del(['compiled/dev/fonts']);
});

gulp.task('cleanIndex', function() {
  return del(['compiled/dev/index.html']);
});

gulp.task('clean', function() {
  return del(['compiled/dev']);
});

gulp.task('default', function() {
  return gutil.log('Gulp is running!');
});

var paths = {
  partials: ['partials/**/*.html'],
  styles: ['sass/**/*'],
  js: ['js/**/*.js']
};

gulp.task('watch:dev', function() {
  gulp.watch(paths.partials, ['index']);
  gulp.watch(paths.js, ['copyJS']);
  gulp.watch(paths.styles, ['scss']);
});

gulp.task('dev', ['index', 'cleanCSS', 'copyFonts', 'copyJS', 'scss', 'watch:dev']);