'use strict';

angular.module('IguanaGUIApp')
.controller('receiveCoinModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  'helper',
  '$storage',
  '$state',
  '$api',
  '$uibModal',
  '$filter',
  '$rates',
  function ($scope, $uibModalInstance, util, helper, $storage, $state, $api, $uibModal, $filter, $rates) {
    $scope.isIguana = $storage['isIguana'];
    $scope.open = open;
    $scope.close = close;
    $scope.util = util;
    $scope.receiveCoin = {};

    var defaultAccount = $scope.isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind,
        defaultCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency,
        _activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0,
        coinRate = $rates.updateRates(_activeCoin, defaultCurrency, true);

    getReceiveCoinAddress();

    // TODO(?): add syscoin:coinaddresshere?amount=0.10000000&label=123&message=123

    $scope.coinAmountKeying = function() {
      if ($scope.receiveCoin.coinAmount)
        $scope.receiveCoin.currencyAmount = coinRate * $scope.receiveCoin.coinAmount;
        $scope.receiveCoin.currencyAmount = $filter('decimalPlacesFormat')($scope.receiveCoin.currencyAmount, 'currency');
    }

    $scope.currencyAmountKeying = function() {
      if ($scope.receiveCoin.currencyAmount && $scope.receiveCoin.currencyAmount > 0)
        $scope.receiveCoin.coinAmount = $scope.receiveCoin.currencyAmount / coinRate;
        $scope.receiveCoin.coinAmount = $filter('decimalPlacesFormat')($scope.receiveCoin.coinAmount, 'coin');
    }

    function getReceiveCoinAddress() {
      var coinAccountAddress = $api.getAccountAddress(_activeCoin, defaultAccount);

      coinAccountAddress.then(function(response) {
        $scope.receiveCoin.address = response;
        $scope.receiveCoin.addressFormatted = $scope.receiveCoin.address.match(/.{1,4}/g).join(' ')
        $scope.receiveCoin.qrCode = $(kjua({ text: $scope.receiveCoin.address })).attr('src');
        $scope.receiveCoin.shareUrl = 'mailto:?subject=Here%20is%20my%20' + supportedCoinsList[_activeCoin].name + '%20address' +
                                      '&body=Hello,%20here%20is%20my%20' + supportedCoinsList[_activeCoin].name + '%20address%20' + $scope.receiveCoin.address;
      }, function(reason) {
        console.log('request failed: ' + reason);
      });

      $scope.receiveCoin.coinName = _activeCoin.toUpperCase();
      $scope.receiveCoin.currencyName = defaultCurrency.toUpperCase();
    }

    $scope.copyAddressToClipboard = function() {
      var temp = angular.element('<input>');

      angular.element(document.body).append(temp);
      temp[0].value = $scope.receiveCoin.address;
      temp[0].select();

      try {
        helper.ngPrepMessageModal($filter('lang')('MESSAGE.ADDRESS_IS_COPIED'), 'blue', true);
        document.execCommand('copy');
      } catch(err) {
        helper.ngPrepMessageModal($filter('lang')('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED_ADDRESS'), 'red', true);
      }

      temp.remove();
    }

    $scope.close = function() {
      $uibModalInstance.dismiss();
    }
  }]);