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
  // default update rate: 15 sec base + 5 sec postpone for each additional coin
  //                      5 coins are going to have 15 + 4 * 5 = 35 sec wait period between rate updates
  var totalCoins = -1;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      if ((!isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') || isIguana) {
        totalCoins++;
      }
    }
  }

  ratesUpdateTimeout = settings.ratesUpdateTimeout + totalCoins * settings.ratesUpdateMultiply;

  // force rates update
  // ! not efficient !
  var isUpdateTriggered = false;

  if (triggerUpdate) {
    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true) {
        if (triggerUpdate && (helper.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !localStorage.getVal('iguana-rates-' + key.toUpperCase()))) {
          if ((!isIguana && localStorage.getVal('iguana-' + key + '-passphrase') && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') || isIguana) {
            isUpdateTriggered = true;
            api.getExternalRate(key.toUpperCase() + '/' + defaultCurrency, updateRateCB);
          }
        }
      }
    }

    if (helperProto.prototype.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
    if (dev.showConsoleMessages && dev.isDev && isUpdateTriggered) console.log('rates update in progress...');
  } else {
    if (!coin) coin = defaultCoin;
    if (!currency) currency = defaultCurrency;

    // iguana based rates are temp disabled
    coinToCurrencyRate = null; //!isIguana ? null : api.getIguanaRate(coin + '/' + currency);
    if (!localStorage.getVal('iguana-rates-' + coin)) api.getExternalRate(key.toUpperCase() + '/' + defaultCurrency, updateRateCB);
    if (!coinToCurrencyRate && localStorage.getVal('iguana-rates-' + coin)) coinToCurrencyRate = localStorage.getVal('iguana-rates-' + coin).value;
    if (returnValue && localStorage.getVal('iguana-rates-' + coin)) return localStorage.getVal('iguana-rates-' + coin).value;
  }
}

function updateRateCB(coin, result) {
  var localStorage = new localStorageProto();

  localStorage.setVal('iguana-rates-' + coin, { 'shortName' : defaultCurrency, 'value': result, 'updatedAt': Date.now() });

  // !not effecient!
  if (helperProto.prototype.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
}