var app = angular.module('IguanaGUIApp.controllers');

app.controller('receiveCoinModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  'helper',
  '$localStorage',
  '$state',
  'api',
  '$uibModal',
  function ($scope, $uibModalInstance, util, helper, $localStorage, $state, api, $uibModal) {
    $scope.isIguana = $localStorage['isIguana'];
    $scope.open = open;
    $scope.close = close;
    $scope.util = util;

    $scope.receiveCoin = {
      address: '',
      qrCode: ''
    };

    var defaultAccount = $scope.isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;
    var defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency;

    getReceiveCoinAddress();

    // TODO(?): add syscoin:coinaddresshere?amount=0.10000000&label=123&message=123

    $scope.sendCoinKeying = function() { // !! ugly !!
      var coinRate,
          coin = $scope.activeCoin ? $scope.activeCoin : $localStorage['iguana-active-coin'] && $localStorage['iguana-active-coin'].id ? $localStorage['iguana-active-coin'].id : 0,
          currencyCoin = $('.currency-coin'),
          currencyObj = $('.currency');

      var localrates = JSON.parse(localstorage.getVal("iguana-rates" + coin.toUpperCase()));
      coinRate = helper.updateRates(coin, defaultCurrency, true);

      currencyCoin.on('keyup', function () {
        var calcAmount = $(this).val() * coinRate;
        currencyObj.val(calcAmount); // TODO: use decimals filter
      });

      currencyObj.on('keyup', function () {
        var calcAmount = $(this).val() / coinRate;
        currencyCoin.val(calcAmount); // TODO: use decimals filter
      });

      // ref: http://jsfiddle.net/dinopasic/a3dw74sz/
      // allow numeric only entry
      var currencyInput = $('.receiving-coin-content .currency-input input');
      currencyInput.keypress(function(event) {
        var inputCode = event.which,
            currentValue = $(this).val();
        if (inputCode > 0 && (inputCode < 48 || inputCode > 57)) {
          if (inputCode == 46) {
            if (helper.getCursorPositionInputElement($(this)) == 0 && currentValue.charAt(0) == '-') return false;
            if (currentValue.match(/[.]/)) return false;
          }
          else if (inputCode == 45) {
            if (currentValue.charAt(0) == '-') return false;
            if (helper.getCursorPositionInputElement($(this)) != 0) return false;
          }
          else if (inputCode == 8) return true;
          else return false;
        }
        else if (inputCode > 0 && (inputCode >= 48 && inputCode <= 57)) {
          if (currentValue.charAt(0) == '-' && helper.getCursorPositionInputElement($(this)) == 0) return false;
        }
      });
      currencyInput.keydown(function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 189 || keyCode === 173 || keyCode === 109) { // disable "-" entry
          event.preventDefault();
        }
      });
    }

    function getReceiveCoinAddress() {
      var _activeCoin = $scope.activeCoin ? $scope.activeCoin : $localStorage['iguana-active-coin'] && $localStorage['iguana-active-coin'].id ? $localStorage['iguana-active-coin'].id : 0;
      var coinAccountAddress = api.getAccountAddress(_activeCoin, defaultAccount);

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

    $scope.copyToClipboard = function() {
      var temp = $('<input>');

      $('body').append(temp);
      //remove spaces from address
      temp.val($('#address').text().replace(/ /g, '')).select();

      try {
        helper.ngPrepMessageModal(util.lang('MESSAGE.ADDRESS_IS_COPIED'), 'blue', true);
        document.execCommand('copy');
      } catch(err) {
        helper.ngPrepMessageModal(util.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED_ADDRESS'), 'red', true);
      }

      temp.remove();
    }

    $scope.close = function() {
      $uibModalInstance.dismiss();
    }
  }]);