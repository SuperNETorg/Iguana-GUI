/*!
 * Iguana dashboard/rates
 *
 */

function updateRates(coin, currency, returnValue, triggerUpdate) {
  var apiExternalRate,
      allDashboardCoins = '',
      totalCoins = 0;

  for (var key in coinsInfo) {
    if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
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
      if (triggerUpdate && (helper.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !localstorage.getVal('iguana-rates-' + key))) {
        if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
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
    //coinToCurrencyRate = localstorage.getVal('iguana-rates-' + coin).value; //!isIguana ? null : api.getIguanaRate(coin + '/' + currency);
    if (!localstorage.getVal('iguana-rates-' + coin)) api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, updateRateCB);
    if (!coinToCurrencyRate && localstorage.getVal('iguana-rates-' + coin)) coinToCurrencyRate = localstorage.getVal('iguana-rates-' + coin).value;
    if (returnValue && localstorage.getVal('iguana-rates-' + coin)) return localstorage.getVal('iguana-rates-' + coin).value;
  }
}

function updateRateCB(coin, result) {
  for (var key in coinsInfo) {
    if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes' && key) {
      localstorage.setVal('iguana-rates-' + key, { 'shortName' : defaultCurrency, 'value': result[key.toUpperCase()][defaultCurrency.toUpperCase()], 'updatedAt': Date.now() });
    }
  }

  if (helper.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
}