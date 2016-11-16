var gulp = require('gulp'),
    injectPartials = require('gulp-inject-partials'),
    del = require('del'),
    gutil = require('gulp-util');

gulp.task('index', ['cleanIndex'], function() {
  return gulp.src('index.html')
             .pipe(injectPartials())
             .pipe(gulp.dest('compiled/dev'));
});

gulp.task('copyJS', ['cleanJS'], function() {
  return gulp.src(['js/**/*'])
             .pipe(gulp.dest('compiled/dev/js'));
});

gulp.task('copyCSS', ['cleanCSS'], function() {
  return gulp.src(['css/**/*'])
             .pipe(gulp.dest('compiled/dev/css'));
});

gulp.task('copyFonts', function() {
  return gulp.src(['fonts/**/*'])
             .pipe(gulp.dest('compiled/dev/fonts'));
});

gulp.task('cleanCSS', function() {
  return del(['compiled/dev/css']);
});

gulp.task('cleanAll', function() {
  return del(['compiled/dev']);
});

gulp.task('cleanJS', function() {
  return del(['compiled/dev/js']);
});

gulp.task('cleanIndex', function() {
  return del(['compiled/dev/index.html']);
});

gulp.task('default', function() {
  return gutil.log('Gulp is running!');
});

var paths = {
  partials: ['partials/**/*.html'],
  styles: ['css/**/*.css'],
  js: ['js/**/*.js']
};

gulp.task('watch:dev', function() {
  gulp.watch(paths.partials, ['index']);
  gulp.watch(paths.styles, ['copyCSS']);
  gulp.watch(paths.js, ['copyJS']);
});

gulp.task('dev', ['cleanAll', 'copyFonts', 'index', 'copyJS', 'copyCSS', 'watch:dev']);