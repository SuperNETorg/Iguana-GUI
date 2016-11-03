'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('settingsController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;
    $scope.$state = $state;

    $scope.checkSession = function() {
      if (!helper.checkSession(true)) {
        $state.go('login');
      }
    }

    $scope.checkSession();

    $scope.logout = function() {
      helper.logout();
      $scope.checkSession();
    }

    $('body').addClass('dashboard-page');

    var currencyArr = [
      { 'shortName': 'USD', 'fullName': helper.lang('CURRENCY.USD'), 'flagId': 'us' },
      { 'shortName': 'EUR', 'fullName': helper.lang('CURRENCY.EUR'), 'flagId': 'eu' },
      { 'shortName': 'AUD', 'fullName': helper.lang('CURRENCY.AUD'), 'flagId': 'au' },
      { 'shortName': 'BGN', 'fullName': helper.lang('CURRENCY.BGN'), 'flagId': 'bg' },
      { 'shortName': 'BRL', 'fullName': helper.lang('CURRENCY.BRL'), 'flagId': 'br' },
      { 'shortName': 'CAD', 'fullName': helper.lang('CURRENCY.CAD'), 'flagId': 'ca' },
      { 'shortName': 'CHF', 'fullName': helper.lang('CURRENCY.CHF'), 'flagId': 'ch' },
      { 'shortName': 'CNY', 'fullName': helper.lang('CURRENCY.CNY'), 'flagId': 'cn' },
      { 'shortName': 'CZK', 'fullName': helper.lang('CURRENCY.CZK'), 'flagId': 'cz' },
      { 'shortName': 'DKK', 'fullName': helper.lang('CURRENCY.DKK'), 'flagId': 'dk' },
      { 'shortName': 'GBP', 'fullName': helper.lang('CURRENCY.GBP'), 'flagId': 'gb' },
      { 'shortName': 'HKD', 'fullName': helper.lang('CURRENCY.HKD'), 'flagId': 'hk' },
      { 'shortName': 'HRK', 'fullName': helper.lang('CURRENCY.HRK'), 'flagId': 'hr' },
      { 'shortName': 'HUF', 'fullName': helper.lang('CURRENCY.HUF'), 'flagId': 'hu' },
      { 'shortName': 'IDR', 'fullName': helper.lang('CURRENCY.IDR'), 'flagId': 'id' },
      { 'shortName': 'ILS', 'fullName': helper.lang('CURRENCY.ILS'), 'flagId': 'il' },
      { 'shortName': 'INR', 'fullName': helper.lang('CURRENCY.INR'), 'flagId': 'in' },
      { 'shortName': 'JPY', 'fullName': helper.lang('CURRENCY.JPY'), 'flagId': 'jp' },
      { 'shortName': 'KRW', 'fullName': helper.lang('CURRENCY.KRW'), 'flagId': 'kr' },
      { 'shortName': 'MXN', 'fullName': helper.lang('CURRENCY.MXN'), 'flagId': 'mx' },
      { 'shortName': 'MYR', 'fullName': helper.lang('CURRENCY.MYR'), 'flagId': 'my' },
      { 'shortName': 'NOK', 'fullName': helper.lang('CURRENCY.NOK'), 'flagId': 'no' },
      { 'shortName': 'NZD', 'fullName': helper.lang('CURRENCY.NZD'), 'flagId': 'nz' },
      { 'shortName': 'PHP', 'fullName': helper.lang('CURRENCY.PHP'), 'flagId': 'ph' },
      { 'shortName': 'PLN', 'fullName': helper.lang('CURRENCY.PLN'), 'flagId': 'pl' },
      { 'shortName': 'RON', 'fullName': helper.lang('CURRENCY.RON'), 'flagId': 'ro' },
      { 'shortName': 'RUB', 'fullName': helper.lang('CURRENCY.RUB'), 'flagId': 'ru' },
      { 'shortName': 'SEK', 'fullName': helper.lang('CURRENCY.SEK'), 'flagId': 'se' },
      { 'shortName': 'SGD', 'fullName': helper.lang('CURRENCY.SGD'), 'flagId': 'sg' },
      { 'shortName': 'THB', 'fullName': helper.lang('CURRENCY.THB'), 'flagId': 'th' },
      { 'shortName': 'TRY', 'fullName': helper.lang('CURRENCY.TRY'), 'flagId': 'tr' },
      { 'shortName': 'ZAR', 'fullName': helper.lang('CURRENCY.ZAR'), 'flagId': 'za' }
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

    $(document).ready(function() {
      api.testConnection();
    });
}]);