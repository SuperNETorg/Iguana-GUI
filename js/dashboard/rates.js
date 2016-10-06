/*!
 * Iguana dashboard/rates
 *
 */

// TODO: fix a bug with wrong sidebar currency values
function updateRates(coin, currency, returnValue, triggerUpdate) {
  var api = new apiProto(),
      apiExternalRate,
      localStorage = new localStorageProto(),
      helper = new helperProto();

  // defer rates update to prevent ban for abuse
  // default update rate: 15 sec base + 5 sec pospone for each additional coin
  //                      5 coins are going to have 15 + 4 * 5 = 35 sec wait period between rate updates
  var totalCoins = -1;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      if ((!isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') || isIguana) {
        totalCoins++;
      }
      // force rates update
      // ! not efficient !
      if (triggerUpdate) {
        if (((!isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) || isIguana) {
          console.log('forced update ' + key + '/' + defaultCurrency);
          api.getExternalRate(key.toUpperCase() + '/' + defaultCurrency, updateRateCB);
        }
      }
    }
  };

  ratesUpdateTimeout = settings.ratesUpdateTimeout + totalCoins * settings.ratesUpdateMultiply;

  if (!triggerUpdate) {
    if (dev.showConsoleMessages && dev.isDev) console.log('last rate upd ' + Math.floor(helper.ratesUpdateElapsedTime(coin)) + 's. ago, wait period ' + ratesUpdateTimeout + 's.');

    if (helper.ratesUpdateElapsedTime(coin) >= ratesUpdateTimeout || !localStorage.getVal('iguana-rates-' + coin)) {
      if (!coin) coin = defaultCoin;
      if (!currency) currency = defaultCurrency;

      // iguana based rates are temp disabled
      coinToCurrencyRate = null; //!isIguana ? null : api.getIguanaRate(coin + '/' + currency);
      // graceful fallback
      // if iguana is not present get a quote form external source
      apiExternalRate = triggerUpdate ? api.getExternalRate(coin + '/' + currency, updateRateCB /*firstRun ? null : updateRateCB*/) : null;

      if (!coinToCurrencyRate || coinToCurrencyRate === 0) {
        coinToCurrencyRate = apiExternalRate;

        if (dev.showConsoleMessages && dev.isDev) console.log(coin + ' rate ' + apiExternalRate + ' ' + defaultCurrency);

        if (returnValue) {
          localStorage.setVal('iguana-rates-' + coin, { 'shortName' : defaultCurrency, 'value': apiExternalRate, 'updatedAt': Date.now() });
          return apiExternalRate;
        }
      } else {
        localStorage.setVal('iguana-rates-' + coin, { 'shortName' : defaultCurrency, 'value': coinToCurrencyRate, 'updatedAt': Date.now() });
        return coinToCurrencyRate;
      }
    } else {
      if (dev.showConsoleMessages && dev.isDev) console.log(coin + ' rate ' + localStorage.getVal('iguana-rates-' + coin).value + ' ' + defaultCurrency);

      if (!coinToCurrencyRate) coinToCurrencyRate = localStorage.getVal('iguana-rates-' + coin).value;
      return localStorage.getVal('iguana-rates-' + coin).value;
    }
    //console.log(localStorage.getVal('iguana-rates-' + coin));
  }
}

function updateRateCB(coin, result) {
  var localStorage = new localStorageProto();

  localStorage.setVal('iguana-rates-' + coin, { 'shortName' : defaultCurrency, 'value': result, 'updatedAt': Date.now() });

  // !not effecient!
  $('.account-coins-repeater').html(constructAccountCoinRepeater());
  bindClickInAccountCoinRepeater();
  updateTotalBalance();
  updateTransactionUnitBalance(true);
}