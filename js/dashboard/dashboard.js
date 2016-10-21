/*!
 * Iguana dashboard
 *
 */

var defaultCurrency = '',
    defaultCoin = '',
    coinToCurrencyRate = 0,
    coinsSelectedByUser = [],
    defaultAccount,
    ratesUpdateTimeout = settings.ratesUpdateTimeout,
    decimalPlacesCoin = settings.decimalPlacesCoin,
    decimalPlacesCurrency = settings.decimalPlacesCurrency,
    decimalPlacesTxUnit = settings.decimalPlacesTxUnit,
    dashboardUpdateTimout = settings.dashboardUpdateTimout,
    dashboardUpdateTimer;

$(document).ready(function() {
  var api = api = new apiProto();
  api.testConnection(initPage);
});

function initPage() {
  var helper = new helperProto();

  if (helper.checkSession(true)) {
    if (document.location.hash === '#dashboard' || !document.location.hash) {
      helper.openPage('dashboard');
    }
    if (document.location.hash === '#settings') {
      helper.openPage('settings');
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

function updateDashboardView(timeout) {
  var helper = new helperProto();

  dashboardUpdateTimer = setInterval(function() {
    //console.clear();
    helper.checkSession();
    if (activeCoin) defaultCoin = activeCoin.toUpperCase();
    updateRates(null, null, null, true);
    constructTransactionUnitRepeater(true);

    if (dev.showConsoleMessages && dev.isDev) console.log('dashboard updated');
  }, timeout * 1000);
}

function getCoinData(coinId) {
  if (supportedCoinsList[coinId]) {
    var coinData = { 'name': supportedCoinsList[coinId].name, 'id': coinId };
    return coinData;
  }

  return false;
}