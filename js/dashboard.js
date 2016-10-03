/*!
 * Iguana dashboard
 *
 */

 /*
  TODO: 1) force synchronous api calls on initial page loading; async on 15 sec info update e.g. rates, balances, tx list
        2) autocorrect decimal places
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

// TODO: move to supported-coins-list
var availableCoinsToAdd = [ // sort(?)
  { id: 'btc', name: 'Bitcoin', color: 'orange' },
  { id: 'btcd', name: 'BitcoinDark', color: 'breeze' },
  { id: 'doge', name: 'Dogecoin', color: 'light-blue' },
  { id: 'frk', name: 'Franko', color: 'yellow' },
  { id: 'gmc', name: 'GameCredits', color: 'orange' },
  { id: 'ltc', name: 'Litecoin', color: 'breeze' },
  { id: 'mzc', name: 'Mazacoin', color: 'light-blue' },
  { id: 'nmc', name: 'Namecoin', color: 'yellow' },
  { id: 'sys', name: 'SysCoin', color: 'orange' },
  { id: 'uno', name: 'Unobtaium', color: 'breeze' },
  { id: 'dgb', name: 'DigiByte', color: 'light-blue' },
  { id: 'zet', name: 'Zetacoin', color: 'yellow' },
  { id: 'btm', name: 'Bitmark', color: 'orange' },
  { id: 'carb', name: 'Carboncoin', color: 'breeze' },
  { id: 'anc', name: 'Anoncoin', color: 'light-blue' }
];

document.write('\x3Cscript type=\"text/javascript\" src=\"js/dashboard/init.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/dashboard/left-sidebar.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/dashboard/balance.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/dashboard/transactions-unit.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/dashboard/add-coin.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/dashboard/rates.js\">\x3C/script>');

$(document).ready(function() {
  var api = api = new apiProto();

  api.testConnection(initDashboard);
  $('.main-content').css({ 'margin': '0 ' + Math.abs((1 - $(window).width() / 1000) * 8) + '%' }); // 1000px min desktop width
});

$(window).resize(function() {
  $('.main-content').css({ 'margin': '0 ' + Math.abs((1 - $(window).width() / 1000) * 8) + '%' });
});

function updateDashboardView(timeout) {
  var helper = new helperProto();

  var dashboardUpdateTimer = setInterval(function() {
    // TODO: refactor, not effective
    //console.clear();
    helper.checkSession();
    if (activeCoin) defaultCoin = activeCoin.toUpperCase();
    //initDashboard();
    updateRates();
    $('.account-coins-repeater').html(constructAccountCoinRepeater());
    bindClickInAccountCoinRepeater();
    updateTotalBalance();
    //updateAccountCoinRepeater();
    updateTransactionUnitBalance(true);
    $('.transactions-list-repeater').html(constructTransactionUnitRepeater());
    if (dev.showConsoleMessages && dev.isDev) console.log('dashboard updated');
  }, timeout * 1000);
}

function getCoinData(coinId) {
  for (var i=0; i < availableCoinsToAdd.length; i++) {
    if (availableCoinsToAdd[i].id.toString() === coinId.toString())
      return availableCoinsToAdd[i];
  }

  return false;
}