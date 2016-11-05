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

/* not the best solution but it works */
function applyDashboardResizeFix() {
  var mainContent = $('.main-content'),
      txUnit = $('.transactions-unit');
  // tx unit resize
  if ($(window).width() > 767) {
    var width = Math.floor(mainContent.width() - $('.coins').width() - 80);
    mainContent.css({ 'padding': '0 30px' });
    txUnit.css({ 'max-width': width, 'width': width });
  } else {
    txUnit.removeAttr('style');
    mainContent.removeAttr('style');
  }
  // coin tiles on the left
  var accountCoinsRepeaterItem = '.account-coins-repeater .item';
  $(accountCoinsRepeaterItem).each(function(index, item) {
    var coin = $(this).attr('data-coin-id');
    $(accountCoinsRepeaterItem + '.' + coin + ' .coin .name').css({ 'width': Math.floor($(accountCoinsRepeaterItem + '.' + coin).width() -
                                                                                  $(accountCoinsRepeaterItem + '.' + coin + ' .coin .icon').width() -
                                                                                  $(accountCoinsRepeaterItem + '.' + coin + ' .balance').width() - 50) });
  });
}

function updateDashboardView(timeout) {
  dashboardUpdateTimer = setInterval(function() {
    //console.clear();`
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