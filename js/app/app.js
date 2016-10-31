/*!
 * Iguana app
 *
 */

var app = (function() {
  var _app = {
        utils:  {},
        api: {},
        vars: {},
        settings: {},
        system: {},
        dev: {},
        views: {},
        data: {}
      };

  var _registerFunction = function(appObj, functionName, functionBody) {
    _app[appObj][functionName] = functionBody;
  }

  return {
    registerFunction: _registerFunction,
    utils: _app.utils,
    api: _app.api,
    data: _app.data,
    vars: _app.vars,
    settings: _app.settings,
    system: _app.system,
    dev: _app.dev,
    views: _app.views
  }
})();

app.registerFunction('system', 'debug',
  function(debugMessage) {
    console.log('debug: ' + debugMessage);
  }
);

app.registerFunction('system', 'registerScript',
  function(scriptUrl) {
    document.write('\x3Cscript type=\"text/javascript\" src=\"js/' + scriptUrl + '\">\x3C/script>');
  }
);