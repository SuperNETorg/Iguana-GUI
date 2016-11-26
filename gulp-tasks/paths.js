exports.getPaths = function(isDev) {
  var jsExtraExt;

  if (isDev)
    jsExtraExt = '.js';
  else
    jsExtraExt = '.min.js';

  var bowerDir = 'bower_components',
    paths = {
      partials: 'partials/**/*.html',
      styles: {
        default: 'sass/**/*',
        prodConcat: 'sass/style.scss',
        extend: [
          bowerDir + '/Iguana-GUI-font/css/iguana-font-coins.css',
          bowerDir + '/cryptocoins/cryptocoins.css',
          bowerDir + '/bootstrap3-trimmed/bootstrap.css'
        ]
      },
      js: {
        default: 'js/**/*.js',
        extend: [
          bowerDir + '/angular/angular' + jsExtraExt,
          bowerDir + '/angular-animate/angular-animate' + jsExtraExt,
          bowerDir + '/angular-bootstrap/ui-bootstrap-tpls' + jsExtraExt,
          bowerDir + '/angular-sanitize/angular-sanitize' + jsExtraExt,
          bowerDir + '/angular-ui-router/release/angular-ui-router' + jsExtraExt,
          bowerDir + '/ngstorage/ngStorage' + jsExtraExt,
          bowerDir + '/jquery/dist/jquery' + jsExtraExt,
          bowerDir + '/kjua/dist/kjua.min.js'
        ]
      },
      fonts: {
        default: 'fonts/**/*',
        extend: [
          bowerDir + '/cryptocoins/fonts/cryptocoins.ttf',
          bowerDir + '/Iguana-GUI-font/font/icomoon.ttf'
        ]
      },
      build: {
        dev: 'compiled/dev',
        prod: 'compiled/prod',
        chrome: 'chrome-app/app'
      },
      chrome:{
        buildMode:'./**/*',
        path:'chrome-app/app'
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
      },
      proximaNova: {
        path: bowerDir + '/proxima-nova/proxima-nova.css',
        style: [
          'normal'
        ],
        weight: [
          400, 600, 700
        ]
      },
      svg: {
        default: bowerDir + '/flag-icon-css/flags',
        size: '1x1',
        flags: [
          'au', 'bg', 'br', 'ca', 'ch', 'cn',
          'cz', 'dk', 'eu', 'gb', 'hk', 'hr',
          'hu', 'id', 'il', 'in', 'jp', 'kr',
          'mx', 'my', 'no', 'nz', 'ph', 'pl',
          'ro', 'ru', 'se', 'sg', 'th', 'tr',
          'us', 'za'
        ]
      }
    };

  return paths;
}