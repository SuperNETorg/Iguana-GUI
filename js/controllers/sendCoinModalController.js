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
  'modal',
  function($scope, $uibModalInstance, util, $storage, $state, $api,
           $uibModal, $filter, $rates, vars, $message, modal) {

    $scope.isIguana = $storage.isIguana;
    $scope.util = util;
    $scope.modal = modal;
    $scope.activeCoin = util.getActiveCoin();
    $scope.checkModel = {};
    $scope.radioModel = true;
    $scope.dropDown = {};
    $scope.feeAllText = '';
    $scope.feeCurrencyAllText = '';
    $scope.checkedAmountType ='';
    $scope.feeAllTextCustom ='';
    $scope.feeCurrencyAllTextCustom = '';
    $scope.karma = { // tests
      defaultChange: defaultChange,
      initSendCoinModal: initSendCoinModal,
      execSendCoinCall: execSendCoinCall
    };

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
      minFee: coinsInfo[$scope.activeCoin].relayFee || settings.defaultRelayFee,
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
      var formHeaderEl = document.querySelectorAll('.send-coin-form .modal-send-coin .form-header'),
          formContentEl = document.querySelectorAll('.send-coin-form .modal-send-coin .form-content');

      angular.element(formHeaderEl).addClass('hidden');
      angular.element(formContentEl).addClass('hidden');
      $scope.modal.sendCoinPassphraseModal.resolve = {
        receivedObject: function() {
          return $scope.receivedObject;
        }
      };

      var modalInstance = $uibModal.open($scope.modal.sendCoinPassphraseModal);

      modalInstance.result.then(onDone);

      modalInstance.closed.then(function() {
        angular.element(formHeaderEl).removeClass('hidden');
        angular.element(formContentEl).removeClass('hidden');
      });

      function onDone(receivedObject) {
        angular.element(formHeaderEl).removeClass('hidden');
        angular.element(formContentEl).removeClass('hidden');

        if (receivedObject) {
          execSendCoinCall();
        }
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
      var coinCurrencyRate = result.getExternalRate[0][coinName][currencyName];

      initSendCoinModal(result.getBalance[0], result.getBalance[1]);
      if (
        $storage.feeSettings &&
        $storage.feeSettings.items &&
        Object.keys($storage.feeSettings.items).length
      ) {
        $scope.dropDown.items = $storage.feeSettings.items;
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
      $scope.activeCoin = $storage.feeSettings.activeCoin;
      $scope.sendCoin.checkedAmountType = $storage.feeSettings.activeCoin !== 'btc' && $scope.sendCoin.checkedAmountType !== 'Minimum' ? 'Minimum' : $scope.sendCoin.checkedAmountType;

      if ($storage.feeSettings.activeCoin !== 'btc') {
        defaultChange('Minimum');
      } else {
        defaultChange($storage.checkedAmountType ? $storage.checkedAmountType : $filter('lang')('SEND.FEE_MIN'));
      }
    }.bind(this));

    function initSendCoinModal(balance, coin) {
      $scope.sendCoin.currencyRate = $rates.updateRates(coin, defaultCurrency, true);
      $scope.sendCoin.initStep = -$scope.sendCoin.initStep;
      $scope.sendCoin.currency = defaultCurrency;
      $scope.sendCoin.coinName = supportedCoinsList[coin].name;
      $scope.sendCoin.coinId = $scope.activeCoin.toUpperCase();
      $scope.sendCoin.coinValue = balance;
      $scope.sendCoin.currencyValue = balance * $scope.sendCoin.currencyRate;

      try {
        if (dev && dev.isDev && sendDataTest && sendDataTest[coin]) {
          $scope.sendCoin.address = sendDataTest[coin].address;
          $scope.sendCoin.amount = sendDataTest[coin].val;
          $scope.sendCoin.note = sendDataTest[coin].note;
        }
      } catch (e) {}
    }

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
      return util.checkFeeCount(fee, $scope.sendCoin.currencyRate);
    }

    // TODO: add sendcoin code:-5 case, wrong coin address
    //                    code:-6, insufficient funds
    function execSendCoinCall() {
      var txDataToSend = {
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
          } else {
            $message.ngPrepMessageModal($filter('lang')('MESSAGE.TRANSACTION_ERROR'), 'red');
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