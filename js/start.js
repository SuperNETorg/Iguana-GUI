/*!
 * Iguana start.js
 *
 */

$(document).ready(function() {
  var api = api = new apiProto();
  api.testConnection(initPage);
});

function initPage() {
  var helper = new helperProto();

  if (helper.checkSession(true)) {
    if (document.location.hash === '#settings') {
      helper.openPage('settings');
    } else {
      console.log('dash');
      helper.openPage('dashboard');
    }
  } else {
    // load auth
    if (document.location.hash === '#create-account') {
      helper.openPage('create-account');
    } else {
      helper.openPage('login');
    }
  }
}