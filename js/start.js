/*!
 * Iguana start.js
 *
 */

$(document).ready(function() {
  api.testConnection(initPage);
});

function initPage() {
  if (helper.checkSession(true)) {
    if (document.location.hash === '#settings') {
      helper.openPage('settings');
    } else {
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