/*!
 * Iguana helpers/router
 * simple page router
 */

helperProto.prototype.openPage = function(url) {
  $('body').removeClass('modal-open');
  clearInterval(dashboardUpdateTimer);

  if (helperProto.prototype.checkSession(true) && url !== 'dashboard' && url !== 'settings') {
    url = document.location.hash.replace('#', '');
  }

  switch (url) {
    case 'login':
      iguanaNullReturnCount = 0;
      document.location.hash = '#login';
      document.title = 'Iguana / Login';
      $('body').html(loginFormPrepTemplate());
      $('body').removeClass('dashboard-page');
      initAuthCB();
      break;
    case 'create-account':
      document.location.hash = '#create-account';
      document.title = 'Iguana / Create account';
      $('body').html(signupFormPrepTemplate());
      $('body').removeClass('dashboard-page');
      initAuthCB();
      break;
    case 'dashboard':
      document.location.hash = '#dashboard';
      document.title = 'Iguana / Dashboard';
      defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;
      var temp = dashboardTemplate.
                 replace(/{{ currency }}/g, defaultCurrency).
                 replace('{{ injectLoader }}', loaderIconTemplate);
      $('body').addClass('dashboard-page');
      $('body').html(temp);
      initDashboard();
      break;
    case 'settings':
      document.location.hash = '#settings';
      document.title = 'Iguana / Settings';
      $('body').addClass('dashboard-page');
      $('body').html(referenceCurrencyTemplate);
      initReferenceCurrency();
      break;
  }
  helperProto.prototype.checkIfIguanaOrCoindIsPresent();
}

helperProto.prototype.getCurrentPage = function() {
  return document.location.hash.replace('#', '');
}