var gulp = require('gulp'),
    injectPartials = require('gulp-inject-partials'),
    del = require('del'),
    rimraf = require('gulp-rimraf');
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat');

var paths = {
  partials: 'partials/**/*.html',
  styles: 'sass/**/*',
  js: 'js/**/*.js',
  fonts: 'fonts/**/*',
  devBuild: 'compiled/dev',
  prodBuild: 'compiled/prod'
};

var js = [
  <!-- legacy -->
  'js/settings.js',
  'js/dev.js',
  'js/lang/en.js',
  'js/supported-coins-list.js',
  'js/iguana-add-coin-list.js',
  //'js/helpers.js',
  <!-- angular -->
  'js/angular/angular.min.js',
  'js/angular/angular-ui-router.min.js',
  'js/angular/angular-sanitize.min.js',
  'js/angular/angular-animate.js',
  'js/angular/angular-storage.min.js',
  'js/angular/angular-clipboard.js',
  'js/angular/jquery.min.js',
  <!-- libs -->
  'js/libs/ui-bootstrap/ui-bootstrap.js',
  'js/libs/kjua-0.1.1.min.js',
  'js/libs/bootstrap.min.js',
  'js/app.js',
  <!-- directives -->
  'js/directives/spinner.js',
  'js/directives/numberOnly.js',
  'js/directives/appTitle.js',
  <!-- filters -->
  'js/filters/decimalPlacesFormat.js',
  'js/filters/lang.js',
  <!-- services -->
  'js/services/storage.js',
  'js/services/rates.js',
  'js/services/auth.js',
  'js/services/datetime.js',
  'js/services/syncStatus.js',
  'js/services/message.js',
  'js/services/passPhraseGenerator.js',
  'js/services/util.js',
  'js/services/api.js',
  <!-- controllers -->
  'js/controllers/loginController.js',
  'js/controllers/signupController.js',
  'js/controllers/dashboardController.js',
  'js/controllers/settingsController.js',
  'js/controllers/topMenuController.js',
  <!-- modal -->
  'js/controllers/addCoinModalController.js',
  'js/controllers/addCoinLoginModalController.js',
  'js/controllers/receiveCoinModalController.js',
  'js/controllers/sendCoinModalController.js',
  'js/controllers/sendCoinPassphraseModalController.js'
];

gulp.task('index', ['cleanIndex'], function() {
  return gulp.src('index.html')
             .pipe(injectPartials())
             .pipe(gulp.dest('compiled/dev'));
});

gulp.task('copyJS', ['cleanJS'], function() {
  return gulp.src(js)
             .pipe(concat('all.js'))
             .pipe(gulp.dest(paths.devBuild));
  /*return gulp.src(paths.js)
             .pipe(gulp.dest(paths.devBuild + '/js'));*/
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