'use strict';

angular.module('IguanaGUIApp')
.service('$rates', [
  '$storage',
  'vars',
  '$api',
  'util',
  '$q',
  function($storage, vars, $api, util, $q) {
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

    this.getRate = function(coin) {
      this.updateRates(coin);
    }

    this.updateRates = function(coin, currency, returnValue, triggerUpdate) {
      var allDashboardCoins = [],
          totalCoins = 0,
          coinToCurrencyRate = 0,
          defaultCoin = '',
          defaultCurrency = this.getCurrency() ? this.getCurrency().name : null || settings.defaultCurrency,
          self = this,
          deferred = $q.defer();

      for (var key in vars.coinsInfo) {
        var storageKey = 'iguana-' + key + '-passphrase';

        if ($storage[storageKey] && $storage[storageKey].logged === 'yes') {
          totalCoins++;
          allDashboardCoins.push(key.toUpperCase());
        }
      }

      var ratesUpdateTimeout = settings.ratesUpdateTimeout; // + totalCoins * settings.ratesUpdateMultiply;

      if (triggerUpdate) {
        // force rates update
        var isUpdateTriggered = false;

        for (var key in vars.coinsInfo) {
          var storageKey = 'iguana-' + key + '-passphrase';

          if (this.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !$storage['iguana-rates-' + key]) {
            if ($storage[storageKey] && $storage[storageKey].logged === 'yes') {
              isUpdateTriggered = true;
            }
          }
        }

        if (isUpdateTriggered) {
          $api.getExternalRate(allDashboardCoins.join(',') + '/' + defaultCurrency)
          .then(function(response) {
            self.updateRateCB(coin, response[0]);
          }, function(response) {
            console.log('request failed: ' + response);
          });

          if (dev.showConsoleMessages && dev.isDev) console.log('rates update in progress...');
        }
      } else {
        if (!coin) coin = defaultCoin;

        // if (!currency) {
        //   currency = defaultCurrency;
        // }

        coin = coin.toLowerCase();
        var coinRates = 'iguana-rates-' + coin;

        // iguana based rates are temp disabled
        //coinToCurrencyRate = localstorage.getVal('iguana-rates-' + coin).value; //!isIguana ? null : $api.getIguanaRate(coin + '/' + currency);
        if (!$storage[coinRates]) {
          $api.getExternalRate(allDashboardCoins.join(',') + '/' + defaultCurrency)
          .then(function(response) {
            self.updateRateCB(coin, response[0]);

            if (!coinToCurrencyRate && $storage[coinRates]) {
              coinToCurrencyRate = $storage[coinRates].value;
            }

            if (returnValue && $storage[coinRates]) {
              deferred.resolve($storage[coinRates].value);
            }
          }, function(reason) {
            console.log('request failed: ' + reason);
          });

          return deferred.promise;
        } else {
          return $storage[coinRates].value;
        }
      }
    };

    this.updateRateCB = function(coin, result) {
      var defaultCurrency = this.getCurrency() ? this.getCurrency().name : null || settings.defaultCurrency;

      for (var key in vars.coinsInfo) {
        var iguanaPassphraseKey = 'iguana-' + key + '-passphrase';

        if ($storage[iguanaPassphraseKey] && $storage[iguanaPassphraseKey].logged === 'yes' && key) {
          $storage['iguana-rates-' + key] = {
            'shortName': defaultCurrency,
            'value': result[key.toUpperCase()][defaultCurrency.toUpperCase()],
            'updatedAt': Date.now()
          };
        }
      }
    };

    this.setCurrency = function(currencyShortName) {
      $storage['iguana-currency'] = { 'name': currencyShortName };

      for (var key in vars.coinsInfo) {
        $storage['iguana-rates-' + key] = {
          'shortName': null,
          'value': null,
          'updatedAt': minEpochTimestamp,
          'forceUpdate': true
        }; // force currency update
      }
    }

    this.getCurrency = function() {
      return $storage['iguana-currency'];
    }
  }
]);