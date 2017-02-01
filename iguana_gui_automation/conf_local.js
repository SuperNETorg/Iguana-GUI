// setup the reporting

var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var reporter = new HtmlScreenshotReporter({
  dest: 'reports',
  filename: 'report.html',
  showSummary: true
});

exports.config = {

  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine',
  specs: ['testNoDaemonRunningNotification.js'],

  capabilities: 
  {
    browserName: 'firefox'
  },

  directConnect: false,
  onPrepare: function() {
    // By default, Protractor use data:text/html,<html></html> as resetUrl, but 
    // location.replace from the data: to the file: protocol is not allowed
    // (we'll get ‘not allowed local resource’ error), so we replace resetUrl with one
    // with the file: protocol (this particular one will open system's root folder)

  jasmine.getEnv().addReporter(reporter);

  browser.ignoreSynchronization = true;
  browser.waitForAngular();
  browser.resetUrl = 'file:///';},
  jasmineNodeOpts: {
  defaultTimeoutInterval: 300000
  }

}
