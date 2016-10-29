/*!
 * Iguana helpers/router
 * simple page router
 */

helperProto.prototype.openPage = function(url) {
  var body = $('body');

  body.removeClass('modal-open');
  clearInterval(dashboardUpdateTimer);

  if (helperProto.prototype.checkSession(true) && url !== 'dashboard' && url !== 'settings') {
    url = document.location.hash.replace('#', '');
  }

  switch (url) {
    case 'login':
      iguanaNullReturnCount = 0;
      body.html(loginFormPrepTemplate()).
           removeClass('dashboard-page');
      initAuthCB();
      break;
    case 'create-account':
      body.html(signupFormPrepTemplate()).
           removeClass('dashboard-page');
      initAuthCB();
      break;
    case 'dashboard':
      defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;
      var temp = dashboardTemplate.
                 replace(/{{ currency }}/g, defaultCurrency).
                 replace('{{ injectLoader }}', loaderIconTemplate);
      body.addClass('dashboard-page').
           html(temp);
      initDashboard();
      break;
    case 'settings':
      body.addClass('dashboard-page').
           html(referenceCurrencyTemplate);
      initReferenceCurrency();
      break;
  }
  helperProto.prototype.initPageUrl(url);
  helperProto.prototype.checkIfIguanaOrCoindIsPresent();
}

helperProto.prototype.getCurrentPage = function() {
  return document.location.hash.replace('#', '');
}

helperProto.prototype.initPageUrl = function(url) {
  document.location.hash = '#' + url;
  document.title = 'Iguana / ' + url.replace(url[0], url[0].toUpperCase()).replace('-', ' ');
}