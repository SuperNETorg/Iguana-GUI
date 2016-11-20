'use strict';

angular.module('IguanaGUIApp')
.controller('settingsController', [
  '$scope',
  '$state',
  '$rates',
  '$auth',
  '$rootScope',
  function($scope, $state, $rates, $auth, $rootScope) {
    $scope.$state = $state;
    $rootScope.$state = $state;
    $scope.enabled = $auth.checkSession(true);

    var currencyArr = [
                       'USD', 'EUR', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK',
                       'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY',
                       'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON',  'RUB',
                       'SEK', 'SGD', 'THB', 'TRY', 'ZAR'
                      ];

    function initCurrencyArray() {
      var currencyArray = [];

      for (var i=0; i < currencyArr.length; i++) {
        currencyArray.push({
          'shortName': currencyArr[i].toUpperCase(),
          'fullName': 'CURRENCY.' + currencyArr[i].toUpperCase(),
          'flagId': currencyArr[i][0].toLowerCase() + currencyArr[i][1].toLowerCase()
        });
      }

      return currencyArray;
    }

    // note: current implementation doesn't permit too often updates
    //       due to possibility of ban for abuse

    $scope.currencyArr = initCurrencyArray();
    $scope.activeCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency;

    $scope.setCurrency = function(item) {
      $scope.activeCurrency = item.shortName;
      $rates.setCurrency($scope.activeCurrency);
      $rates.updateRates(null, null, null, true);
    }
  }
]);