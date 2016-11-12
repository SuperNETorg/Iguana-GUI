'use strict';

angular.module('IguanaGUIApp')
.controller('sendCoinModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  'helper',
  '$storage',
  '$state',
  'api',
  '$uibModal',
  '$filter',
  function ($scope, $uibModalInstance, util, helper, $storage, $state, api, $uibModal, $filter) {
    $scope.isIguana = $storage['isIguana'];
    $scope.close = close;
    $scope.util = util;
    $scope.helper = helper;
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;

    var defaultAccount = $scope.isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;
    var defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency;

    $scope.sendCoin = {
      initStep: true,
      success: false,
      address: '',
      amount: 0,
      amountCurrency: 0,
      fee: 0,
      feeCurrency: 0,
      note: '',
      passphrase: ''
    };

    api.getBalance(defaultAccount, $scope.activeCoin, toggleSendCoinModal);

    function toggleSendCoinModal(balance, coin) {
      $scope.sendCoin.currencyRate = helper.updateRates(coin, defaultCurrency, true);
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

    $scope.verifySendCoinForm = function() {
      // ref: http://jsfiddle.net/dinopasic/a3dw74sz/
      // allow numeric only entry
      var modalSendCoinClass = '.modal-send-coin';
      $(modalSendCoinClass + ' .tx-amount,' + modalSendCoinClass + ' .tx-amount-currency,' + modalSendCoinClass + ' .tx-fee,' + modalSendCoinClass + ' .tx-fee-currency').keypress(function (event) {
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

      // calc on keying
      $(modalSendCoinClass + ' .tx-amount,' +
        modalSendCoinClass + ' .tx-amount-currency,' +
        modalSendCoinClass + ' .tx-fee,' +
        modalSendCoinClass + ' .tx-fee-currency').keydown(function(e) {
          var keyCode = e.keyCode || e.which;

          if (keyCode === 189 || keyCode === 173 || keyCode === 109) { // disable "-" entry
            e.preventDefault();
          }
      });
      $(modalSendCoinClass + ' .tx-amount').keyup(function(e) {
        txAmountFeeKeyupEvent(e, 'tx-amount', true, $(this).val());
      });
      $(modalSendCoinClass + ' .tx-amount-currency').keyup(function(e) {
        txAmountFeeKeyupEvent(e, 'tx-amount', false);
      });
      $(modalSendCoinClass + ' .tx-fee').keyup(function(e) {
        txAmountFeeKeyupEvent(e, 'tx-fee', true);
      });
      $(modalSendCoinClass + ' .tx-fee-currency').keyup(function(e) {
        txAmountFeeKeyupEvent(e, 'tx-fee', false);
      });

      function txAmountFeeKeyupEvent(evt, fieldName, type, val) {
        var keyCode = evt.keyCode || evt.which;

        if (keyCode !== 9) {
          var currentCoinRate = helper.updateRates($scope.sendCoin.coinId, defaultCurrency, true);

          var modalSendCoinField = modalSendCoinClass + ' .' + fieldName;
          if (type) {
            var fielValue = $(modalSendCoinField).val() * currentCoinRate;
            $(modalSendCoinField + '-currency').val(fieldValue); // TODO: use decimals filter
          } else {
            var fieldValue = $(modalSendCoinField + '-currency').val() / currentCoinRate;
            $(modalSendCoinField).val(fieldValue); // TODO: use decimals filter
          }
        } else {
          evt.preventDefault();
        }
      }
    }

    $scope.validateSendCoinForm = function() {
      if (validateSendCoinForm()) {
        $scope.sendCoin.amountCurrency = $scope.sendCoin.currencyRate * $scope.sendCoin.amount;
        $scope.sendCoin.feeCurrency = $scope.sendCoin.currencyRate * $scope.sendCoin.fee;
        $scope.sendCoin.initStep = false;
      }
    }

    // TODO: 1) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
    //      1a) address byte prefix check
    function validateSendCoinForm() {
      var isValid = false,
          activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
          coinData = $scope.activeCoin,
          activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
          activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html()),
          txAddressVal = $('.tx-address').val(),
          txAmountVal = $('.tx-amount').val(),
          txFeeVal = $('.tx-fee').val(),
          errorClassName = 'validation-field-error', // TODO: rename error class names
          errorClassName2 = 'col-red';

      // address
      var txAddressObj = $('.tx-address'),
          txAddressValidation = $('.tx-address-validation');
      if (txAddressVal.length !== 34) {
        txAddressObj.addClass(errorClassName);
        txAddressValidation.html($filter('lang')('SEND.INCORRECT_ADDRESS')).
                            addClass(errorClassName2);
      } else {
        txAddressObj.removeClass(errorClassName);
        txAddressValidation.html($filter('lang')('SEND.ENTER_A_WALLET_ADDRESS')).
                            removeClass(errorClassName2);
      }
      // coin amount
      var txAmountObj = $('.tx-amount'),
          txAmountCurrencyObj = $('.tx-amount-currency'),
          txAmountValidation = $('.tx-amount-validation'),
          coinName = $('.account-coins-repeater .item.active').attr('data-coin-id').toUpperCase();
      if (Number(txAmountVal) === 0 || !txAmountVal.length || txAmountVal > activeCoinBalanceCoin) {
        txAmountObj.addClass(errorClassName);
        txAmountCurrencyObj.addClass(errorClassName);
        txAmountValidation.html(Number(txAmountVal) === 0 || !txAmountVal.length ? $filter('lang')('SEND.PLEASE_ENTER_AN_AMOUNT') : $filter('lang')('SEND.NOT_ENOUGH_MONEY') + ' ' + activeCoinBalanceCoin + ' ' + coinName).
                           addClass(errorClassName2);
      } else {
        txAmountObj.removeClass(errorClassName);
        txAmountCurrencyObj.removeClass(errorClassName);
        txAmountValidation.html(util.lang('RECEIVE.ENTER_IN') + ' ' + coinName + ' ' + $filter('lang')('LOGIN.OR') + ' ' + defaultCurrency.toUpperCase()).
                           removeClass(errorClassName2);
      }
      // fee
      var txFeeObj = $('.tx-fee'),
          txFeeCurrencyObj = $('.tx-fee-currency'),
          txFeeValidation = $('.tx-fee-validation');
      if ((Number(txFeeVal) + Number(txAmountVal)) > activeCoinBalanceCoin) {
        txFeeObj.addClass(errorClassName);
        txFeeCurrencyObj.addClass(errorClassName);
        txFeeValidation.html((activeCoinBalanceCoin - Number(txAmountVal)) > 0 ? $filter('lang')('SEND.FEE_CANNOT_EXCEED') + ' ' + (activeCoinBalanceCoin - Number(txAmountVal)) : $filter('lang')('SEND.TOTAL_AMOUNT_CANNOT_EXCEED') + ' ' + activeCoinBalanceCoin).
                        addClass(errorClassName2);
      }
      if (Number(txFeeVal) < (coinsInfo[$scope.activeCoin].relayFee || 0.00001)) { // TODO: settings
        txFeeObj.addClass(errorClassName);
        txFeeCurrencyObj.addClass(errorClassName);
        txFeeValidation.html((coinsInfo[$scope.activeCoin].relayFee || 0.00001) + ' ' + $filter('lang')('SEND.IS_A_MIN_REQUIRED_FEE')).
                        addClass(errorClassName2);
      }
      if ((Number(txFeeVal) >= (coinsInfo[$scope.activeCoin].relayFee || 0.00001)) && (Number(txFeeVal) + Number(txAmountVal)) < activeCoinBalanceCoin)  {
        txFeeObj.removeClass(errorClassName);
        txFeeCurrencyObj.removeClass(errorClassName);
        txFeeValidation.html($filter('lang')('SEND.MINIMUM_FEE')).
                        removeClass(errorClassName2);
      }

      if (txAddressVal.length !== 34 ||
          Number(txAmountVal) === 0 ||
          !txAmountVal.length ||
          txAmountVal > activeCoinBalanceCoin ||
          Number(txFeeVal + txAmountVal) > activeCoinBalanceCoin) {
        isValid = false;
      } else {
        isValid = true;
      }

      return isValid;
    }

    $scope.sendCoinFormConfirm = function() {
      if (!isIguana) {
        helper.toggleModalWindow('send-coin-confirm-passphrase', 300);
        // dev only
        if (dev.isDev && !isIguana && dev.coinPW.coind[$scope.activeCoin]) $scope.sendCoin.passphrase = dev.coinPW.coind[$scope.activeCoin];
        if (dev.isDev && isIguana && dev.coinPW.iguana) $scope.sendCoin.passphrase = dev.coinPW.iguana;
      } else {
        execSendCoinCall();
      }
    }

    $scope.confirmSendCoinPassphrase = function() {
      var coindWalletLogin = api.walletLogin($scope.sendCoin.passphrase, settings.defaultWalletUnlockPeriod, $scope.activeCoin);

      if (coindWalletLogin !== -14) {
        helper.toggleModalWindow('send-coin-confirm-passphrase', 300);
        execSendCoinCall();
      } else {
        helper.prepMessageModal($filter('lang')('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
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
        setTxFeeResult = api.setTxFee($scope.activeCoin, sendFormDataCopy.fee);
      }

      var sendTxResult = api.sendToAddress($scope.activeCoin, txDataToSend);

      if (sendTxResult.length === 64) {
        $scope.sendCoin.success = true;
      } else {
        // go to an error step
        helper.prepMessageModal($filter('lang')('MESSAGE.TRANSACTION_ERROR'), 'red', true);
      }

      // revert pay fee
      if (setTxFeeResult) api.setTxFee($scope.activeCoin, 0);
    }

    $scope.sendCoinKeying = function() { // !! ugly !!
      var coinRate,
          coin = $scope.activeCoin ? $scope.activeCoin : $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0,
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

    $scope.close = function() {
      $uibModalInstance.dismiss();
    }
  }]);