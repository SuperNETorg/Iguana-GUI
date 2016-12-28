'use strict';

angular.module('IguanaGUIApp')
.controller('sendCoinModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  '$storage',
  '$state',
  '$api',
  '$uibModal',
  '$filter',
  '$rates',
  'vars',
  '$message',
  '$http',
  function($scope, $uibModalInstance, util, $storage, $state, $api, $uibModal, $filter, $rates, vars, $message, $http) {
    $scope.isIguana = $storage.isIguana;
    $scope.util = util;
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    $scope.checkModel = {};
    $scope.radioModel = true;
    $scope.dropDown = {};
    $scope.feeAllText = '';
    $scope.feeCurrencyAllText = '';
    $scope.checkedAmountType ='';
    $scope.feeAllTextCustom ='';
    $scope.feeCurrencyAllTextCustom = '';

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };

    $scope.change = onChange;

    function onChange() {
      if (Object.keys($scope.checkModel).length) {
        $scope.checkedAmountType = $scope.$eval($scope.checkModel.type).name;

        if ($scope.checkedAmountType !== 'Custom') {
          $scope.sendCoin.fee = $scope.$eval($scope.checkModel.type).coin;
          $scope.sendCoin.feeCurrency = $scope.$eval($scope.checkModel.type).amount;
        } else {
          $scope.sendCoin.fee = '';
          $scope.sendCoin.feeCurrency = '';
        }

        $scope.feeAllText = $scope.sendCoin.fee + ' ' + $scope.sendCoin.coinId;
        $scope.feeCurrencyAllText = $scope.sendCoin.feeCurrency + ' ' + $scope.sendCoin.currency;
      }
    }

    function defaultChange(itemName) {
      $scope.dropDown.items.forEach(function(el) {
        if (el.name === itemName) {
          $scope.sendCoin.fee = el.coin;
          $scope.sendCoin.feeCurrency = el.amount;
          $scope.feeAllText = $scope.sendCoin.fee + ' ' + $scope.sendCoin.coinId;
          $scope.feeCurrencyAllText = $scope.sendCoin.feeCurrency + ' ' + $scope.sendCoin.currency;
        }
      });
    }

    var defaultAccount = $scope.isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind,
        defaultCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency,
        coinsInfo = vars.coinsInfo;

    $scope.sendCoin = {
      initStep: true,
      success: false,
      address: '',
      amount: '',
      amountCurrency: '',
      fee: '',
      minFee: coinsInfo[$scope.activeCoin].relayFee || 0.00001,
      feeCurrency: '',
      note: '',
      passphrase: '',
      valid: {
        address: true,
        amount: {
          empty: false,
          notEnoughMoney: false
        },
        fee: {
          empty: false,
          notEnoughMoney: false
        }
      },
      entryFormIsValid: false
    };

    $scope.sendCoin.checkedAmountType = $storage.checkedAmountType ? $storage.checkedAmountType : $filter('lang')('SEND.FEE_MIN');

    $scope.$modalInstance = {};
    $scope.receivedObject = undefined;

    $scope.openSendCoinPassphraseModal = function() {
      angular.element(document.querySelectorAll('.send-coin-form .modal-send-coin .form-header')).addClass('hidden');
      angular.element(document.querySelectorAll('.send-coin-form .modal-send-coin .form-content')).addClass('hidden');
      var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'sendCoinPassphraseModalController',
            templateUrl: 'partials/send-coin-passphrase.html',
            appendTo: angular.element(document.querySelector('.send-coin-passphrase-modal-container')),
            resolve: {
              receivedObject: function() {
                return $scope.receivedObject;
              }
            }
          });
      modalInstance.result.then(onDone);

      modalInstance.closed.then(function () {
        angular.element(document.querySelectorAll('.send-coin-form .modal-send-coin .form-header')).removeClass('hidden');
        angular.element(document.querySelectorAll('.send-coin-form .modal-send-coin .form-content')).removeClass('hidden');
      });
      function onDone(receivedObject) {
        angular.element(document.querySelectorAll('.send-coin-form .modal-send-coin .form-header')).removeClass('hidden');
        angular.element(document.querySelectorAll('.send-coin-form .modal-send-coin .form-content')).removeClass('hidden');
        if (receivedObject) execSendCoinCall();
      }
    };

    var currencyName = $rates.getCurrency() ? $rates.getCurrency().name : settings.defaultCurrency,
        coinName = $storage['iguana-active-coin']['id'].toUpperCase();

    $api.feeCoins(
      $scope.activeCoin,
      defaultAccount,
      currencyName,
      coinName
    ).then(function(result) {
      var fastestFee = checkFeeCount(result.bitcoinFees.data.fastestFee),
          halfHourFee = checkFeeCount(result.bitcoinFees.data.halfHourFee),
          hourFee = checkFeeCount(result.bitcoinFees.data.hourFee),
          coinCurrencyRate = result.getExternalRate[0][coinName][currencyName];

      initSendCoinModal(result.getBalance[0], result.getBalance[1]);
debugger;
      if (
        $storage['feeSettings'] &&
        $storage['feeSettings']['items'] &&
        Object.keys($storage['feeSettings']['items']).length
      ) {
        $scope.dropDown.items = $storage['feeSettings']['items'];
      } else {
        $scope.dropDown.emptyItems = true;
        $scope.dropDown.items = [{
          id: 0,
          name: $filter('lang')('SEND.FEE_MIN'),
          coin: $scope.sendCoin.minFee.toFixed(7),
          amount: ($scope.sendCoin.minFee * coinCurrencyRate).toFixed(12),
          feeMinTime: '',
          feeMaxTime: ''
        }, {
          id: 1,
          name: $filter('lang')('SEND.FEE_LOW'),
          coin: '',
          amount: '',
          feeMinTime: '',
          feeMaxTime: ''
        }, {
          id: 2,
          name: $filter('lang')('SEND.FEE_NORMAL'),
          coin: '',
          amount: '',
          feeMinTime: '',
          feeMaxTime: ''
        }, {
          id: 3,
          name: $filter('lang')('SEND.FEE_HIGH'),
          coin: '',
          amount: '',
          feeMinTime: '',
          feeMaxTime: ''
        }];
      }


      $scope.sendCoin.checkedAmountType = $storage.checkedAmountType ? $storage.checkedAmountType : 'Minimum';
      $scope.activeCoin = $storage['feeSettings']['activeCoin'];
      $scope.sendCoin.checkedAmountType = $storage['feeSettings']['activeCoin'] !== 'btc' && $scope.sendCoin.checkedAmountType != 'Minimum' ? 'Minimum' : $scope.sendCoin.checkedAmountType;

      if($storage['feeSettings']['activeCoin'] !=='btc') {

        defaultChange('Minimum');
      }else{
        defaultChange($storage.checkedAmountType ? $storage.checkedAmountType : $filter('lang')('SEND.FEE_MIN'));
      }
    }.bind(this));

    function initSendCoinModal(balance, coin) {
      $scope.sendCoin.currencyRate = $rates.updateRates(coin, defaultCurrency, true);
      $scope.sendCoin.initStep = -$scope.sendCoin.initStep;
      $scope.sendCoin.currency = defaultCurrency;
      debugger;
      $scope.sendCoin.coinName = supportedCoinsList[coin].name;
      $scope.sendCoin.coinId = $scope.activeCoin.toUpperCase();
      $scope.sendCoin.coinValue = balance;
      $scope.sendCoin.currencyValue = balance * $scope.sendCoin.currencyRate;

      if (dev && dev.isDev && sendDataTest && sendDataTest[coin]) {
        $scope.sendCoin.address = sendDataTest[coin].address;
        $scope.sendCoin.amount = sendDataTest[coin].val;
        $scope.sendCoin.note = sendDataTest[coin].note;
      }
    }

    $scope.toggleSendCoinModal = function() {
      toggleSendCoinModal();
    };

    $scope.sendCoinKeyingAmount = function() {
      if ($scope.sendCoin.amount)
        $scope.sendCoin.amountCurrency = $filter('decimalPlacesFormat')($scope.sendCoin.amount * $scope.sendCoin.currencyRate, 'currency');
    };

    $scope.sendCoinKeyingAmountCurrency = function() {
      if ($scope.sendCoin.amountCurrency && $scope.sendCoin.amountCurrency > 0)
        $scope.sendCoin.amount = $filter('decimalPlacesFormat')($scope.sendCoin.amountCurrency / $scope.sendCoin.currencyRate, 'coin');
    };

    $scope.sendFee = function() {
      if ($scope.sendCoin.fee) {
        $scope.sendCoin.feeCurrency = parseFloat($filter('decimalPlacesFormat')(parseFloat($scope.sendCoin.fee) * $scope.sendCoin.currencyRate, 'currency')).toFixed(7);
        if (isNaN($scope.sendCoin.feeCurrency)) {
          $scope.sendCoin.feeCurrency = '';
        }
      } else {
        $scope.sendCoin.feeCurrency = '';
      }
    };

    $scope.sendFeeCurrency = function() {
      if ($scope.sendCoin.feeCurrency) {
        $scope.sendCoin.fee = ($scope.sendCoin.feeCurrency / $scope.sendCoin.currencyRate);
        if (isNaN($scope.sendCoin.fee)) {
          $scope.sendCoin.fee = '';
        }
      } else {
        $scope.sendCoin.fee = '';
      }
    };

    $scope.validateSendCoinForm = function() {
      if (_validateSendCoinForm()) {
        $scope.sendCoin.amountCurrency = $scope.sendCoin.currencyRate * $scope.sendCoin.amount;
        $scope.sendCoin.feeCurrency = ($scope.sendCoin.currencyRate * $scope.sendCoin.fee).toFixed(12);
        $scope.sendCoin.initStep = false;
      }
    };

    // TODO: 1) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
    //      1a) address byte prefix check
    function _validateSendCoinForm() {
      // address
      $scope.sendCoin.valid.address = $scope.sendCoin.address.length !== 34 ? false : true;
      $scope.sendCoin.valid.feeType = $scope.sendCoin.fee ? true : false;
      // coin amount
      if (Number($scope.sendCoin.amount) === 0 || !$scope.sendCoin.amount.length || Number($scope.sendCoin.amount) > Number($scope.sendCoin.coinValue)) {
        $scope.sendCoin.valid.amount.empty = (Number($scope.sendCoin.amount) === 0 || !$scope.sendCoin.amount.length) ? true : false;
        $scope.sendCoin.valid.amount.notEnoughMoney = (Number($scope.sendCoin.amount) === 0 || !$scope.sendCoin.amount.length) ? false : true;
      } else {
        $scope.sendCoin.valid.amount.empty = $scope.sendCoin.valid.amount.notEnoughMoney = false;
      }
      // fee
      if ((Number($scope.sendCoin.fee) + Number($scope.sendCoin.amount)) > Number($scope.sendCoin.coinValue)) {
        $scope.sendCoin.valid.fee.empty = false;
        $scope.sendCoin.valid.fee.notEnoughMoney = true;
      }
      if (Number($scope.sendCoin.fee) < Number($scope.sendCoin.minFee)) {
        $scope.sendCoin.valid.fee.empty = true;
        $scope.sendCoin.valid.fee.notEnoughMoney = false;
      }
      if ((Number($scope.sendCoin.fee) >= Number($scope.sendCoin.minFee))
          && (Number($scope.sendCoin.fee) + Number($scope.sendCoin.amount)) < Number($scope.sendCoin.coinValue)) {
        $scope.sendCoin.valid.fee.empty = false;
        $scope.sendCoin.valid.fee.notEnoughMoney = false;
      }
      if ($scope.dropDown.item === null) { // TODO: ng-class
        angular.element(document.querySelectorAll('.dropdown-button-style')).addClass('validation-field-error');
      }
      // final check
      if ($scope.sendCoin.address.length !== 34 ||
          Number($scope.sendCoin.amount) === 0 ||
          !$scope.sendCoin.amount.length ||
          (Number($scope.sendCoin.fee) < Number($scope.sendCoin.minFee)) ||
          Number($scope.sendCoin.amount) > Number($scope.sendCoin.coinValue) ||
          (Number($scope.sendCoin.fee) + Number($scope.sendCoin.amount)) > Number($scope.sendCoin.coinValue)) {
        $scope.sendCoin.entryFormIsValid = false;
      } else {
        $scope.sendCoin.entryFormIsValid = true;
      }

      return $scope.sendCoin.entryFormIsValid;
    }

    $scope.sendCoinFormConfirm = function() {
      if (!$scope.isIguana) {
        $scope.openSendCoinPassphraseModal();
      } else {
        execSendCoinCall();
      }
    };

    function checkFeeCount(fee) {
      var coin = fee * 1024 / 100000000, // satoshi per kb
          amount = $scope.sendCoin.currencyRate * coin;

      return {
        'coin': coin,
        'amount': amount
      };
    }

    function execSendCoinCall() {
      var setTxFeeResult = false,
          txDataToSend = {
            address: $scope.sendCoin.address,
            amount: $scope.sendCoin.amount,
            note: $scope.sendCoin.note
          };

      if (Number($scope.sendCoin.fee) !== Number(coinsInfo[$scope.activeCoin].relayFee) /*&& Number($scope.sendCoin.fee) !== 0.00001*/ && Number($scope.sendCoin.fee) !== 0) {
        $api.setTxFee($scope.activeCoin, $scope.sendCoin.fee)
        .then(function(response) {
          $api.sendToAddress($scope.activeCoin, txDataToSend)
          .then(function(response) {
            if (response.length === 64) {
              $scope.sendCoin.success = true;
            }
            // revert pay fee
            $api.setTxFee($scope.activeCoin, coinsInfo[$scope.activeCoin].relayFee)
            .then(function(response) {
              // do nothing
            }, function(reason) {
              console.log('request failed: ' + reason);
              // TODO: show error
            });
          }, function(reason) {
            $message.ngPrepMessageModal($filter('lang')('MESSAGE.TRANSACTION_ERROR'), 'red');
            // revert pay fee
            $api.setTxFee($scope.activeCoin, coinsInfo[$scope.activeCoin].relayFee)
            .then(function(response) {
              // do nothing
            }, function(reason) {
              console.log('request failed: ' + reason);
              // TODO: show error
            });
          });
        }, function(reason) {
          $message.ngPrepMessageModal($filter('lang')('MESSAGE.TRANSACTION_ERROR'), 'red');
          console.log('request failed: ' + reason);
        });
      } else {
        $api.sendToAddress($scope.activeCoin, txDataToSend)
        .then(function(response) {
          if (response.length === 64) {
            $scope.sendCoin.success = true;
          }
        }, function(reason) {
          $message.ngPrepMessageModal($filter('lang')('MESSAGE.TRANSACTION_ERROR'), 'red');
          console.log('request failed: ' + reason);
        });
      }
    }

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };
  }
]);