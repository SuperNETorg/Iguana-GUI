'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('settingsController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;

    var currencyArr = [
      { 'shortName': 'USD', 'fullName': helper.lang('CURRENCY.USD'), 'flagid': 'us', 'selected': true },
      { 'shortName': 'EUR', 'fullName': helper.lang('CURRENCY.EUR'), 'flagid': 'eu' },
      { 'shortName': 'AUD', 'fullName': helper.lang('CURRENCY.AUD'), 'flagid': 'au' },
      { 'shortName': 'BGN', 'fullName': helper.lang('CURRENCY.BGN'), 'flagid': 'bg' },
      { 'shortName': 'BRL', 'fullName': helper.lang('CURRENCY.BRL'), 'flagid': 'br' },
      { 'shortName': 'CAD', 'fullName': helper.lang('CURRENCY.CAD'), 'flagid': 'ca' },
      { 'shortName': 'CHF', 'fullName': helper.lang('CURRENCY.CHF'), 'flagid': 'ch' },
      { 'shortName': 'CNY', 'fullName': helper.lang('CURRENCY.CNY'), 'flagid': 'cn' },
      { 'shortName': 'CZK', 'fullName': helper.lang('CURRENCY.CZK'), 'flagid': 'cz' },
      { 'shortName': 'DKK', 'fullName': helper.lang('CURRENCY.DKK'), 'flagid': 'dk' },
      { 'shortName': 'GBP', 'fullName': helper.lang('CURRENCY.GBP'), 'flagid': 'gb' },
      { 'shortName': 'HKD', 'fullName': helper.lang('CURRENCY.HKD'), 'flagid': 'hk' },
      { 'shortName': 'HRK', 'fullName': helper.lang('CURRENCY.HRK'), 'flagid': 'hr' },
      { 'shortName': 'HUF', 'fullName': helper.lang('CURRENCY.HUF'), 'flagid': 'hu' },
      { 'shortName': 'IDR', 'fullName': helper.lang('CURRENCY.IDR'), 'flagid': 'id' },
      { 'shortName': 'ILS', 'fullName': helper.lang('CURRENCY.ILS'), 'flagid': 'il' },
      { 'shortName': 'INR', 'fullName': helper.lang('CURRENCY.INR'), 'flagid': 'in' },
      { 'shortName': 'JPY', 'fullName': helper.lang('CURRENCY.JPY'), 'flagid': 'jp' },
      { 'shortName': 'KRW', 'fullName': helper.lang('CURRENCY.KRW'), 'flagid': 'kr' },
      { 'shortName': 'MXN', 'fullName': helper.lang('CURRENCY.MXN'), 'flagid': 'mx' },
      { 'shortName': 'MYR', 'fullName': helper.lang('CURRENCY.MYR'), 'flagid': 'my' },
      { 'shortName': 'NOK', 'fullName': helper.lang('CURRENCY.NOK'), 'flagid': 'no' },
      { 'shortName': 'NZD', 'fullName': helper.lang('CURRENCY.NZD'), 'flagid': 'nz' },
      { 'shortName': 'PHP', 'fullName': helper.lang('CURRENCY.PHP'), 'flagid': 'ph' },
      { 'shortName': 'PLN', 'fullName': helper.lang('CURRENCY.PLN'), 'flagid': 'pl' },
      { 'shortName': 'RON', 'fullName': helper.lang('CURRENCY.RON'), 'flagid': 'ro' },
      { 'shortName': 'RUB', 'fullName': helper.lang('CURRENCY.RUB'), 'flagid': 'ru' },
      { 'shortName': 'SEK', 'fullName': helper.lang('CURRENCY.SEK'), 'flagid': 'se' },
      { 'shortName': 'SGD', 'fullName': helper.lang('CURRENCY.SGD'), 'flagid': 'sg' },
      { 'shortName': 'THB', 'fullName': helper.lang('CURRENCY.THB'), 'flagid': 'th' },
      { 'shortName': 'TRY', 'fullName': helper.lang('CURRENCY.TRY'), 'flagid': 'tr' },
      { 'shortName': 'ZAR', 'fullName': helper.lang('CURRENCY.ZAR'), 'flagid': 'za' }
    ];

    // note: current implementation doesn't permit too often updates
    //       due to possibility of ban for abuse

    function initReferenceCurrency() {
      var outPut = '',
          defaultActive = '';

      var index = 0;
      for (var i in currencyArr)
      {
        defaultActive = '';

        if ((helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency) === currencyArr[i].shortName) {
          defaultActive = 'selected';
        }

        outPut += templates.all.repeaters.currencyItem.
                  replace('{{ defaultActive }}', defaultActive).
                  replace('{{ index }}', index).
                  replace('{{ flagId }}', currencyArr[i].flagid).
                  replace('{{ shortName }}', currencyArr[i].shortName).
                  replace('{{ fullName }}', currencyArr[i].fullName);
        index++;
      }

      $('.currency-loop').html(outPut);

      var country = $('.country-li');
      country.on('click',function(){
        var id = $(this).attr('data-id');

        helper.setCurrency(currencyArr[id].shortName);
        defaultCurrency = currencyArr[id].shortName;
        updateRates(null, null, null, true);
        country.removeClass('selected');
        $(this).addClass('selected');
      });

      var topMenuItem = $('.top-menu .item');
      topMenuItem.click(function() {
        topMenuItem.each(function(index, item) {
          $(this).removeClass('active');
        });

        $(this).addClass('active');
        helper.openPage($(this).attr('data-url'));
      });

      $('.lnk-logout').click(function() {
        helper.logout();
      });
    }
}]);