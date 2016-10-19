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
    dashboardUpdateTimout = settings.dashboardUpdateTimout;

$(document).ready(function() {
  var api = api = new apiProto();

  api.testConnection(initDashboard);
  $('.main-content').css({ 'margin': '0 ' + Math.abs((1 - $(window).width() / 1000) * 8) + '%' }); // 1000px min desktop width
});

$(window).resize(function() {
  $('.main-content').css({ 'margin': '0 ' + Math.abs((1 - $(window).width() / 1000) * 8) + '%' });
  opacityToggleOnAddCoinRepeaterScroll();
});

function updateDashboardView(timeout) {
  var helper = new helperProto();

  var dashboardUpdateTimer = setInterval(function() {
    // TODO: refactor, not effective
    //console.clear();
    helper.checkSession();
    if (activeCoin) defaultCoin = activeCoin.toUpperCase();
    updateRates(null, null, null, true);
    constructTransactionUnitRepeater();

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