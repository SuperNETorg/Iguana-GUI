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
    $scope.isIguana = $storage['isIguana'];
    $scope.close = close;
    $scope.util = util;
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;

    util.bodyBlurOn();

    $scope.dropDown = {};

    function checkFeeCount(fee) {
      var coin = fee*1024/100000000;
      var amount = $scope.sendCoin.currencyRate * coin;
      return {
        'coin':coin,
        'amount':amount
      };
    }

    // current item
    $scope.dropDown.item = null; // dropDown.items[1];

    // directive callback function
    $scope.dropDown.callback = function(item) {
      $scope.sendCoin.fee = $scope.dropDown.item.coin;
      if( $scope.dropDown.item !== null ) {
        angular.element(document.querySelectorAll('.dropdown-button-style')).removeClass('validation-field-error');
      }
      $scope.dropDown.fromCallback = 'callback received ' + angular.toJson(item);
    };

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

    $scope.$modalInstance = {};
    $scope.receivedObject = undefined;

    $scope.openSendCoinPassphraseModal = function() {
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

      function onDone(receivedObject) {
        if (receivedObject) execSendCoinCall();
      }
    };

    $api.getBalance(defaultAccount, $scope.activeCoin)
    .then(function(response) {
      initSendCoinModal(response[0], response[1]);

      $http.get('https://bitcoinfees.21.co/api/v1/fees/recommended').then(function(response) {
        var fastestFee = checkFeeCount(response.data.fastestFee);
        var halfHourFee = checkFeeCount(response.data.halfHourFee);
        var hourFee = checkFeeCount(response.data.hourFee);

        $scope.dropDown.items = [{
          id: 0,
          name: 'Low (Slow confirmation)',
          text: hourFee.coin + $scope.sendCoin.coinId + '=$' + hourFee.amount.toFixed(15),
          coin: hourFee.coin,
          amount: hourFee.amount.toFixed(15)
        }, {
          id: 1,
          name: 'Normal (Average confirmation)',
          text: halfHourFee.coin + $scope.sendCoin.coinId + '=$' + halfHourFee.amount.toFixed(15),
          coin: halfHourFee.coin,
          amount: halfHourFee.amount.toFixed(15)
        }, {
          id: 2,
          name: 'High (Fast confirmation)',
          text: fastestFee.coin + $scope.sendCoin.coinId + '=$' + fastestFee.amount.toFixed(15),
          coin: fastestFee.coin,
          amount: fastestFee.amount.toFixed(15)
        }, {
          id: 3,
          name: 'Custom fee',
          text: '',
          coin: '',
          amount: ''
        }];
      });

    }, function(reason) {
      console.log('request failed: ' + reason);
    });

    function initSendCoinModal(balance, coin) {
      $scope.sendCoin.currencyRate = $rates.updateRates(coin, defaultCurrency, true);
      $scope.sendCoin.initStep = -$scope.sendCoin.initStep;
      $scope.sendCoin.currency = defaultCurrency;
      $scope.sendCoin.coinName = supportedCoinsList[coin].name;
      $scope.sendCoin.coinId = $scope.activeCoin.toUpperCase();
      $scope.sendCoin.coinValue = balance;
      $scope.sendCoin.currencyValue = balance * $scope.sendCoin.currencyRate;

      if (dev && dev.isDev && sendDataTest && sendDataTest[coin]) {
        $scope.sendCoin.address = sendDataTest[coin].address;
        $scope.sendCoin.amount = sendDataTest[coin].val;
        $scope.sendCoin.fee = 0.00001;
        $scope.sendCoin.note = sendDataTest[coin].note;
      }

      console.log($scope.sendCoin);
    }

    $scope.toggleSendCoinModal = function() {
      toggleSendCoinModal();
    }

    $scope.sendCoinKeyingAmount = function() {
      if ($scope.sendCoin.amount)
        $scope.sendCoin.amountCurrency = $filter('decimalPlacesFormat')($scope.sendCoin.amount * $scope.sendCoin.currencyRate, 'currency');
    }
    $scope.sendCoinKeyingAmountCurrency = function() {
      if ($scope.sendCoin.amountCurrency && $scope.sendCoin.amountCurrency > 0)
        $scope.sendCoin.amount = $filter('decimalPlacesFormat')($scope.sendCoin.amountCurrency / $scope.sendCoin.currencyRate, 'coin');
    }
    $scope.sendCoinKeyingFee = function() {
      if ($scope.sendCoin.fee)
        $scope.sendCoin.feeCurrency = $filter('decimalPlacesFormat')($scope.sendCoin.fee * $scope.sendCoin.currencyRate, 'currency');
    }
    $scope.sendCoinKeyingFeeCurrency = function() {
      if ($scope.sendCoin.feeCurrency && $scope.sendCoin.feeCurrency > 0)
        $scope.sendCoin.fee = $filter('decimalPlacesFormat')($scope.sendCoin.feeCurrency / $scope.sendCoin.currencyRate, 'coin');
    }

    $scope.validateSendCoinForm = function() {
      if (_validateSendCoinForm()) {
        $scope.sendCoin.amountCurrency = $scope.sendCoin.currencyRate * $scope.sendCoin.amount;
        $scope.sendCoin.feeCurrency = $scope.sendCoin.currencyRate * $scope.sendCoin.fee;
        $scope.sendCoin.initStep = false;
      }
    }

    // TODO: 1) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
    //      1a) address byte prefix check
    function _validateSendCoinForm() {
      // address
      $scope.sendCoin.valid.address = $scope.sendCoin.address.length !== 34 ? false : true;
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
      if (Number($scope.sendCoin.fee) < Number($scope.sendCoin.minFee)) { // TODO: settings
        $scope.sendCoin.valid.fee.empty = true;
        $scope.sendCoin.valid.fee.notEnoughMoney = false;
      }
      if ((Number($scope.sendCoin.fee) >= Number($scope.sendCoin.minFee))
          && (Number($scope.sendCoin.fee) + Number($scope.sendCoin.amount)) < Number($scope.sendCoin.coinValue)) {
        $scope.sendCoin.valid.fee.empty = false;
        $scope.sendCoin.valid.fee.notEnoughMoney = false;
      }
      if( $scope.dropDown.item === null ) {
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
    }

    function execSendCoinCall() {
      var setTxFeeResult = false,
          txDataToSend = {
            address: $scope.sendCoin.address,
            amount: $scope.sendCoin.amount,
            note: $scope.sendCoin.note
          };

      if (Number($scope.sendCoin.fee) !== Number(coinsInfo[$scope.activeCoin].relayFee) && Number($scope.sendCoin.fee) !== 0.00001 && Number($scope.sendCoin.fee) !== 0) {
        $api.setTxFee($scope.activeCoin, $scope.sendCoin.fee)
        .then(function(response) {
          $api.sendToAddress($scope.activeCoin, txDataToSend)
          .then(function(response) {
            if (response.length === 64) {
              $scope.sendCoin.success = true;
            }
            // revert pay fee
            $api.setTxFee($scope.activeCoin, coinsInfo[$scope.activeCoin].relayFee || 0.00001)
            .then(function(response) {
              // do nothing
            }, function(reason) {
              console.log('request failed: ' + reason);
              // TODO: show error
            });
          }, function(reason) {
            $message.ngPrepMessageModal($filter('lang')('MESSAGE.TRANSACTION_ERROR'), 'red');
            // revert pay fee
            $api.setTxFee($scope.activeCoin, coinsInfo[$scope.activeCoin].relayFee || 0.00001)
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
    }

    $scope.$on('$destroy', function() {
      util.bodyBlurOff();
    });
  }
]);