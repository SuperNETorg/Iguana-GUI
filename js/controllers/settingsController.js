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
      { 'shortName': 'USD', 'fullName': 'CURRENCY.USD', 'flagId': 'us' },
      { 'shortName': 'EUR', 'fullName': 'CURRENCY.EUR', 'flagId': 'eu' },
      { 'shortName': 'AUD', 'fullName': 'CURRENCY.AUD', 'flagId': 'au' },
      { 'shortName': 'BGN', 'fullName': 'CURRENCY.BGN', 'flagId': 'bg' },
      { 'shortName': 'BRL', 'fullName': 'CURRENCY.BRL', 'flagId': 'br' },
      { 'shortName': 'CAD', 'fullName': 'CURRENCY.CAD', 'flagId': 'ca' },
      { 'shortName': 'CHF', 'fullName': 'CURRENCY.CHF', 'flagId': 'ch' },
      { 'shortName': 'CNY', 'fullName': 'CURRENCY.CNY', 'flagId': 'cn' },
      { 'shortName': 'CZK', 'fullName': 'CURRENCY.CZK', 'flagId': 'cz' },
      { 'shortName': 'DKK', 'fullName': 'CURRENCY.DKK', 'flagId': 'dk' },
      { 'shortName': 'GBP', 'fullName': 'CURRENCY.GBP', 'flagId': 'gb' },
      { 'shortName': 'HKD', 'fullName': 'CURRENCY.HKD', 'flagId': 'hk' },
      { 'shortName': 'HRK', 'fullName': 'CURRENCY.HRK', 'flagId': 'hr' },
      { 'shortName': 'HUF', 'fullName': 'CURRENCY.HUF', 'flagId': 'hu' },
      { 'shortName': 'IDR', 'fullName': 'CURRENCY.IDR', 'flagId': 'id' },
      { 'shortName': 'ILS', 'fullName': 'CURRENCY.ILS', 'flagId': 'il' },
      { 'shortName': 'INR', 'fullName': 'CURRENCY.INR', 'flagId': 'in' },
      { 'shortName': 'JPY', 'fullName': 'CURRENCY.JPY', 'flagId': 'jp' },
      { 'shortName': 'KRW', 'fullName': 'CURRENCY.KRW', 'flagId': 'kr' },
      { 'shortName': 'MXN', 'fullName': 'CURRENCY.MXN', 'flagId': 'mx' },
      { 'shortName': 'MYR', 'fullName': 'CURRENCY.MYR', 'flagId': 'my' },
      { 'shortName': 'NOK', 'fullName': 'CURRENCY.NOK', 'flagId': 'no' },
      { 'shortName': 'NZD', 'fullName': 'CURRENCY.NZD', 'flagId': 'nz' },
      { 'shortName': 'PHP', 'fullName': 'CURRENCY.PHP', 'flagId': 'ph' },
      { 'shortName': 'PLN', 'fullName': 'CURRENCY.PLN', 'flagId': 'pl' },
      { 'shortName': 'RON', 'fullName': 'CURRENCY.RON', 'flagId': 'ro' },
      { 'shortName': 'RUB', 'fullName': 'CURRENCY.RUB', 'flagId': 'ru' },
      { 'shortName': 'SEK', 'fullName': 'CURRENCY.SEK', 'flagId': 'se' },
      { 'shortName': 'SGD', 'fullName': 'CURRENCY.SGD', 'flagId': 'sg' },
      { 'shortName': 'THB', 'fullName': 'CURRENCY.THB', 'flagId': 'th' },
      { 'shortName': 'TRY', 'fullName': 'CURRENCY.TRY', 'flagId': 'tr' },
      { 'shortName': 'ZAR', 'fullName': 'CURRENCY.ZAR', 'flagId': 'za' }
    ];

    // note: current implementation doesn't permit too often updates
    //       due to possibility of ban for abuse

    $scope.currencyArr = currencyArr;
    $scope.activeCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency;

    $scope.setCurrency = function(item) {
      $scope.activeCurrency = item.shortName;
      $rates.setCurrency($scope.activeCurrency);
      $rates.updateRates(null, null, null, true);
    }
  }
]);