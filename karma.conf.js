module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    preprocessors: {
    },
    reporters: ['spec'],
    port: 65009,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    files: [
      'bower_components/angular/angular.js',                             // angular
      'bower_components/angular-ui-router/release/angular-ui-router.js', // ui-router
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/kjua/dist/kjua.min.js',
      'bower_components/ngstorage/ngStorage.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'js/settings.js',
      'js/supported-coins-list.js',
      'js/dev.js',
      'js/lang/en.js',
      'js/iguana-add-coin-list.js',
      'js/app.js',
      'js/services/storage.js',
      'js/services/rates.js',
      'js/services/auth.js',
      'js/services/datetime.js',
      'js/services/syncStatus.js',
      'js/services/message.js',
      'js/services/passPhraseGenerator.js',
      'js/services/util.js',
      'js/services/api.js',
      'tests/passPhraseGeneratorService.spec.js'
    ]
  });
};
