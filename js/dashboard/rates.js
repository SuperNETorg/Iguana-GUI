/*!
 * Iguana dashboard/rates
 *
 */

function updateRates(coin, currency, returnValue, triggerUpdate) {
  var api = new apiProto(),
      apiExternalRate,
      localStorage = new localStorageProto(),
      helper = new helperProto(),
      allDashboardCoins = '',
      totalCoins = 0;

  for (var key in coinsInfo) {
    if (localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
      totalCoins++;
      allDashboardCoins = allDashboardCoins + key.toUpperCase() + ',';
    }
  }

  if (allDashboardCoins[allDashboardCoins.length - 1] === ',') {
    allDashboardCoins = allDashboardCoins.replace(/,$/, '');
  }

  ratesUpdateTimeout = settings.ratesUpdateTimeout; // + totalCoins * settings.ratesUpdateMultiply;

  // force rates update
  var isUpdateTriggered = false;

  if (triggerUpdate) {
    for (var key in coinsInfo) {
      if (triggerUpdate && (helper.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !localStorage.getVal('iguana-rates-' + key))) {
        if (localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
          isUpdateTriggered = true;
        }
      }
    }

    if (isUpdateTriggered) {
      api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, updateRateCB);
      if (dev.showConsoleMessages && dev.isDev) console.log('rates update in progress...');
    }
  } else {
    if (!coin) coin = defaultCoin;
    if (!currency) currency = defaultCurrency;
    coin = coin.toLowerCase();

    // iguana based rates are temp disabled
    //coinToCurrencyRate = localStorage.getVal('iguana-rates-' + coin).value; //!isIguana ? null : api.getIguanaRate(coin + '/' + currency);
    if (!localStorage.getVal('iguana-rates-' + coin)) api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, updateRateCB);
    if (!coinToCurrencyRate && localStorage.getVal('iguana-rates-' + coin)) coinToCurrencyRate = localStorage.getVal('iguana-rates-' + coin).value;
    if (returnValue && localStorage.getVal('iguana-rates-' + coin)) return localStorage.getVal('iguana-rates-' + coin).value;
  }
}

function updateRateCB(coin, result) {
  var localStorage = new localStorageProto();

  for (var key in coinsInfo) {
    if (localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes' && key) {
      localStorage.setVal('iguana-rates-' + key, { 'shortName' : defaultCurrency, 'value': result[key.toUpperCase()][defaultCurrency.toUpperCase()], 'updatedAt': Date.now() });
    }
  }

  if (helperProto.prototype.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
}