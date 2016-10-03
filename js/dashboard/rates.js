/*!
 * Iguana dashboard/rates
 *
 */

// TODO: fix a bug with wrong sidebar currency values
function updateRates(coin, currency, returnValue) {
  var api = new apiProto(),
      apiExternalRate,
      localStorage = new localStorageProto(),
      helper = new helperProto();

  //console.log('sec. elapsed since last rates update ' + Math.floor(helper.ratesUpdateElapsedTime()));
  if (helper.ratesUpdateElapsedTime(coin) >= ratesUpdateTimeout || !localStorage.getVal('iguana-rates-' + coin)) {
    if (!coin) coin = defaultCoin;
    if (!currency) currency = defaultCurrency;

    coinToCurrencyRate = !isIguana ? null : api.getIguanaRate(coin + '/' + currency);
    // graceful fallback
    // if iguana is not present get a quote form external source
    apiExternalRate = api.getExternalRate(coin + '/' + currency)

    if (!coinToCurrencyRate || coinToCurrencyRate === 0) {
      coinToCurrencyRate = apiExternalRate;

      if (returnValue) {
        localStorage.setVal('iguana-rates-' + coin, { 'shortName' : defaultCurrency, 'value': apiExternalRate, 'updatedAt': Date.now() });
        return apiExternalRate;
      }
    } else {
      localStorage.setVal('iguana-rates-' + coin, { 'shortName' : defaultCurrency, 'value': coinToCurrencyRate, 'updatedAt': Date.now() });
      return coinToCurrencyRate;
    }
  } else {
    if (!coinToCurrencyRate) coinToCurrencyRate = localStorage.getVal('iguana-rates-' + coin).value;
    return localStorage.getVal('iguana-rates-' + coin).value;
  }
  //console.log(localStorage.getVal('iguana-rates-' + coin));
}