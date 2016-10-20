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
  applyDashboardResizeFix();
});

$(window).resize(function() {
  applyDashboardResizeFix();
});

/* not the best solution but it works */
function applyDashboardResizeFix() {
  $('.main-content').css({ 'margin': '0 ' + Math.abs((1 - $(window).width() / 1000) * 8) + '%' }); // margin fix on low res screens
  // tx unit resize
  $('.transactions-unit').css({ 'max-width': Math.floor($('.main-content').width() - $('.coins').width() - 110) });
  $('.transactions-unit').css({ 'width': Math.floor($('.main-content').width() - $('.coins').width() - 110) });
  // hash shading
  $('.transactions-list-repeater .item .hash').css({ 'width': Math.floor($('.transactions-list-repeater').width() / 1.35 -
                                                                         $('.transactions-list-repeater .item:first-child .status').width() -
                                                                         $('.transactions-list-repeater .item:first-child .amount').width() -
                                                                         $('.transactions-list-repeater .item:first-child .progress-status').width()) });
  // coin tiles on the left
  $('.account-coins-repeater .item').each(function(index, item) {
    var coin = $(this).attr('data-coin-id');
    $('.account-coins-repeater .item.' + coin + ' .coin .name').css({ 'width': Math.floor($('.account-coins-repeater .item.' + coin).width() -
                                                                                          $('.account-coins-repeater .item.' + coin + ' .coin .icon').width() -
                                                                                          $('.account-coins-repeater .item.' + coin + ' .balance').width() - 50) });
  });
  opacityToggleOnAddCoinRepeaterScroll();
}

function updateDashboardView(timeout) {
  var helper = new helperProto();

  var dashboardUpdateTimer = setInterval(function() {
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