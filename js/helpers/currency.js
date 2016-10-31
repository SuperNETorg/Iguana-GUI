/*!
 * Iguana helpers/currency
 *
 */

helperProto.prototype.setCurrency = function(currencyShortName) {
  localstorage.setVal('iguana-currency', { 'name' : currencyShortName });

  for (var key in coinsInfo) {
    localstorage.setVal('iguana-rates-' + key, { 'shortName' : null,
                                                 'value': null,
                                                 'updatedAt': minEpochTimestamp,
                                                 'forceUpdate': true }); // force currency update
  }
}

helperProto.prototype.getCurrency = function() {
  return localstorage.getVal('iguana-currency');
}