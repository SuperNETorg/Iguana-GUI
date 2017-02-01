
  exports.config = 
{
  //seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

  sauceUser: 'kashifali',
  sauceKey: '8cd2d272-c757-404e-a9ca-7a808d4800cb',
  sauceSeleniumAddress: 'localhost:4445/wd/hub',
  //framework: 'jasmine',
 specs: ['spec.js'],
  multiCapabilities: [
 {
        // by default, these first two browsers will come up in 
        // Linux if you don't specify an OS
        'name': 'Chrome',
        'browserName': 'chrome',
        'tunnel-identifier': 'myTunnel'
 },

 {
        'name': 'Firefox',
        'browserName': 'firefox',
         'tunnel-identifier': 'myTunnel'
 },


{
        'name': 'Win7',
        'os': 'Windows 7',
        'browserName': 'internet explorer',
        'version': '8.0',
        'tunnel-identifier': 'myTunnel'
},


],

  directConnect: false,
  onPrepare: function() {
    // By default, Protractor use data:text/html,<html></html> as resetUrl, but 
    // location.replace from the data: to the file: protocol is not allowed
    // (we'll get ‘not allowed local resource’ error), so we replace resetUrl with one
    // with the file: protocol (this particular one will open system's root folder)
  browser.ignoreSynchronization = true;
  browser.waitForAngular();
  browser.resetUrl = 'file:///';},
  jasmineNodeOpts: {
    defaultTimeoutInterval: 300000
  }

}
