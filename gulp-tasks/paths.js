var paths = {
      partials: 'partials/**/*.html',
      styles: 'sass/**/*',
      js: 'js/**/*.js',
      fonts: 'fonts/**/*',
      build: {
        dev: 'compiled/dev',
        prod: 'compiled/prod'
      },
      configurable: {
        js: [
          'js/settings.js',
          'js/supported-coins-list.js'
        ]
      },
      omit: {
        prod: {
          js: [
            'js/dev.js'
          ]
        }
      }
    };

exports.getPaths = function() {
  return paths;
}