'use strict';

angular.module('IguanaGUIApp')
.service('$rates', ['$storage', 'vars', '$api', 'helper', function ($storage, vars, $api, helper) {
  var minEpochTimestamp = 1471620867; // Jan 01 1970

  this.ratesUpdateElapsedTime = function(coin) {
    if ($storage['iguana-rates-' + coin.toLowerCase()]) {
      var currentEpochTime = new Date(Date.now()) / 1000,
          secondsElapsed = Number(currentEpochTime) - Number($storage['iguana-rates-' + coin.toLowerCase()].updatedAt / 1000);

      return secondsElapsed;
    } else {
      return false;
    }
  }

  /* TODO: move to rates service */
  this.updateRates = function(coin, currency, returnValue, triggerUpdate) {
    var coinsInfo = vars.coinsInfo;

    var apiExternalRate,
        allDashboardCoins = '',
        totalCoins = 0,
        coinToCurrencyRate = 0,
        defaultCoin = '',
        defaultCurrency = this.getCurrency() ? this.getCurrency().name : null || settings.defaultCurrency;

    for (var key in vars.coinsInfo) {
      if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
        totalCoins++;
        allDashboardCoins = allDashboardCoins + key.toUpperCase() + ',';
      }
    }

    allDashboardCoins = helper.trimComma(allDashboardCoins);

    var ratesUpdateTimeout = settings.ratesUpdateTimeout; // + totalCoins * settings.ratesUpdateMultiply;

    // force rates update
    var isUpdateTriggered = false;

    if (triggerUpdate) {
      for (var key in vars.coinsInfo) {
        if (triggerUpdate && (this.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !$storage['iguana-rates-' + key])) {
          if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
            isUpdateTriggered = true;
          }
        }
      }

      if (isUpdateTriggered) {
        $api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, this.updateRateCB);
        if (dev.showConsoleMessages && dev.isDev) console.log('rates update in progress...');
      }
    } else {
      if (!coin) coin = defaultCoin;
      if (!currency) currency = defaultCurrency;
      coin = coin.toLowerCase();

      // iguana based rates are temp disabled
      //coinToCurrencyRate = localstorage.getVal('iguana-rates-' + coin).value; //!isIguana ? null : $api.getIguanaRate(coin + '/' + currency);
      if (!$storage['iguana-rates-' + coin]) $api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, this.updateRateCB);
      if (!coinToCurrencyRate && $storage['iguana-rates-' + coin]) coinToCurrencyRate = $storage['iguana-rates-' + coin].value;
      if (returnValue && $storage['iguana-rates-' + coin]) return $storage['iguana-rates-' + coin].value;
    }
  }.bind(this);

  this.updateRateCB = function(coin, result) {
    var defaultCurrency = this.getCurrency() ? this.getCurrency().name : null || settings.defaultCurrency;

    for (var key in vars.coinsInfo) {
      if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes' && key) {
        $storage['iguana-rates-' + key] = {
          'shortName' : defaultCurrency,
          'value': result[key.toUpperCase()][defaultCurrency.toUpperCase()],
          'updatedAt': Date.now()
        };
      }
    }
  }.bind(this);

  this.setCurrency = function(currencyShortName) {
    $storage['iguana-currency'] = { 'name' : currencyShortName };

    for (var key in vars.coinsInfo) {
      $storage['iguana-rates-' + key] = {
        'shortName' : null,
        'value': null,
        'updatedAt': minEpochTimestamp,
        'forceUpdate': true
      }; // force currency update
    }
  }

  this.getCurrency = function() {
    return $storage['iguana-currency'];
  }
}]);