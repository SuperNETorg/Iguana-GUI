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
      helper.openPage('dashboard');
      applyDashboardResizeFix();

      $(window).resize(function() {
        applyDashboardResizeFix();
      });
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