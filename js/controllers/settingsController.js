'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('settingsController', ['$scope', '$http', '$state', 'helper', 'util',
  function($scope, $http, $state, helper, util) {
    $scope.helper = helper;
    $scope.util = util;
    $scope.$state = $state;
    $scope.enabled = helper.checkSession(true);

    $('body').addClass('dashboard-page');

    var currencyArr = [
      { 'shortName': 'USD', 'fullName': util.lang('CURRENCY.USD'), 'flagId': 'us' },
      { 'shortName': 'EUR', 'fullName': util.lang('CURRENCY.EUR'), 'flagId': 'eu' },
      { 'shortName': 'AUD', 'fullName': util.lang('CURRENCY.AUD'), 'flagId': 'au' },
      { 'shortName': 'BGN', 'fullName': util.lang('CURRENCY.BGN'), 'flagId': 'bg' },
      { 'shortName': 'BRL', 'fullName': util.lang('CURRENCY.BRL'), 'flagId': 'br' },
      { 'shortName': 'CAD', 'fullName': util.lang('CURRENCY.CAD'), 'flagId': 'ca' },
      { 'shortName': 'CHF', 'fullName': util.lang('CURRENCY.CHF'), 'flagId': 'ch' },
      { 'shortName': 'CNY', 'fullName': util.lang('CURRENCY.CNY'), 'flagId': 'cn' },
      { 'shortName': 'CZK', 'fullName': util.lang('CURRENCY.CZK'), 'flagId': 'cz' },
      { 'shortName': 'DKK', 'fullName': util.lang('CURRENCY.DKK'), 'flagId': 'dk' },
      { 'shortName': 'GBP', 'fullName': util.lang('CURRENCY.GBP'), 'flagId': 'gb' },
      { 'shortName': 'HKD', 'fullName': util.lang('CURRENCY.HKD'), 'flagId': 'hk' },
      { 'shortName': 'HRK', 'fullName': util.lang('CURRENCY.HRK'), 'flagId': 'hr' },
      { 'shortName': 'HUF', 'fullName': util.lang('CURRENCY.HUF'), 'flagId': 'hu' },
      { 'shortName': 'IDR', 'fullName': util.lang('CURRENCY.IDR'), 'flagId': 'id' },
      { 'shortName': 'ILS', 'fullName': util.lang('CURRENCY.ILS'), 'flagId': 'il' },
      { 'shortName': 'INR', 'fullName': util.lang('CURRENCY.INR'), 'flagId': 'in' },
      { 'shortName': 'JPY', 'fullName': util.lang('CURRENCY.JPY'), 'flagId': 'jp' },
      { 'shortName': 'KRW', 'fullName': util.lang('CURRENCY.KRW'), 'flagId': 'kr' },
      { 'shortName': 'MXN', 'fullName': util.lang('CURRENCY.MXN'), 'flagId': 'mx' },
      { 'shortName': 'MYR', 'fullName': util.lang('CURRENCY.MYR'), 'flagId': 'my' },
      { 'shortName': 'NOK', 'fullName': util.lang('CURRENCY.NOK'), 'flagId': 'no' },
      { 'shortName': 'NZD', 'fullName': util.lang('CURRENCY.NZD'), 'flagId': 'nz' },
      { 'shortName': 'PHP', 'fullName': util.lang('CURRENCY.PHP'), 'flagId': 'ph' },
      { 'shortName': 'PLN', 'fullName': util.lang('CURRENCY.PLN'), 'flagId': 'pl' },
      { 'shortName': 'RON', 'fullName': util.lang('CURRENCY.RON'), 'flagId': 'ro' },
      { 'shortName': 'RUB', 'fullName': util.lang('CURRENCY.RUB'), 'flagId': 'ru' },
      { 'shortName': 'SEK', 'fullName': util.lang('CURRENCY.SEK'), 'flagId': 'se' },
      { 'shortName': 'SGD', 'fullName': util.lang('CURRENCY.SGD'), 'flagId': 'sg' },
      { 'shortName': 'THB', 'fullName': util.lang('CURRENCY.THB'), 'flagId': 'th' },
      { 'shortName': 'TRY', 'fullName': util.lang('CURRENCY.TRY'), 'flagId': 'tr' },
      { 'shortName': 'ZAR', 'fullName': util.lang('CURRENCY.ZAR'), 'flagId': 'za' }
    ];

    // note: current implementation doesn't permit too often updates
    //       due to possibility of ban for abuse

    $scope.currencyArr = currencyArr;
    $scope.activeCurrency = helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency;

    $scope.setCurrency = function(item) {
      $scope.activeCurrency = item.shortName;
      helper.setCurrency($scope.activeCurrency);
      helper.updateRates(null, null, null, true);
    }
}]);