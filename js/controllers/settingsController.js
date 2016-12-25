'use strict';

angular.module('IguanaGUIApp')
.controller('settingsController', [
  '$scope',
  '$state',
  '$rates',
  '$auth',
  '$rootScope',
  '$storage',
  '$api',
  'vars',
  '$filter',
  function($scope, $state, $rates, $auth, $rootScope, $storage, $api, vars, $filter) {
    $scope.$state = $state;
    $rootScope.$state = $state;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.checkedAmountType = $storage.checkedAmountType ? $storage.checkedAmountType : $storage.checkedAmountType = $filter('lang')('SEND.FEE_MIN');
    $scope.enabled = $auth.checkSession(true);
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    $scope.currencyArr = [];
    $scope.activeCurrency = [];
    $scope.sendCoin = {};
    $scope.checkModel = {};

    var currencyArr =
          [
           'USD', 'EUR', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK',
           'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY',
           'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON',  'RUB',
           'SEK', 'SGD', 'THB', 'TRY', 'ZAR'
          ],
      defaultAccount = $scope.isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind,
      defaultCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency;

    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      $scope.sendCoin = {
        initStep: true,
        success: false,
        address: '',
        amount: '',
        amountCurrency: '',
        fee: '',
        minFee: vars.coinsInfo[$scope.activeCoin].relayFee || 0.00001,
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
      $scope.currencyArr = initCurrencyArray();
      $scope.activeCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency;

      var currencyName = $rates.getCurrency() ? $rates.getCurrency().name : settings.defaultCurrency,
        coinName = $storage['iguana-active-coin']['id'].toUpperCase();

      $api.feeCoins(
        $scope.activeCoin,
        defaultAccount,
        currencyName,
        coinName
      )
      .then(function(result) {
        var fastestFee = checkFeeCount(result.bitcoinFees.data.fastestFee),
            halfHourFee = checkFeeCount(result.bitcoinFees.data.halfHourFee),
            hourFee = checkFeeCount(result.bitcoinFees.data.hourFee),
            coinCurrencyRate = result.getExternalRate[0][coinName][currencyName];

          if ($scope.activeCoin === 'btc') {
            var feeTime = {
              default: {
                min: '',
                max: ''
              },
              low: {
                min: '',
                max: ''
              },
              normal: {
                min: '',
                max: ''
              },
              high: {
                min: '',
                max: ''
              }
            };

            result.bitcoinFeesAll.data.fees.forEach(function(el) {
              if (el.maxFee === 0) {
                feeTime.default = {
                  min: el.minMinutes,
                  max: el.maxMinutes
                };
              }
              if (el.maxFee === result.bitcoinFeesAll.data.fastestFee) {
                feeTime.high = {
                  min: el.minMinutes,
                  max: el.maxMinutes
                };
              }
              if (el.maxFee === result.bitcoinFeesAll.data.halfHourFee) {
                feeTime.normal = {
                  min: el.minMinutes,
                  max: el.maxMinutes
                };
              }
              if (el.maxFee === result.bitcoinFeesAll.data.hourFee) {
                feeTime.low = {
                  min: el.minMinutes,
                  max: el.maxMinutes
                };
              }
            });
            $scope.items = [{
              id: 0,
              name: $filter('lang')('SEND.FEE_MIN'),
              coin: $scope.sendCoin.minFee.toFixed(7),
              amount: (coinCurrencyRate * $scope.sendCoin.minFee).toFixed(12),
              feeMinTime: feeTime.default.min,
              feeMaxTime: feeTime.default.max
            }, {
              id: 1,
              name: $filter('lang')('SEND.FEE_LOW'),
              coin: hourFee.coin.toFixed(7),
              amount: (coinCurrencyRate * hourFee.coin).toFixed(12),
              feeMinTime: feeTime.low.min,
              feeMaxTime: feeTime.low.max
            }, {
              id: 2,
              name: $filter('lang')('SEND.FEE_NORMAL'),
              coin: halfHourFee.coin.toFixed(7),
              amount: (coinCurrencyRate * halfHourFee.coin).toFixed(12),
              feeMinTime: feeTime.normal.min,
              feeMaxTime: feeTime.normal.max
            }, {
              id: 3,
              name: $filter('lang')('SEND.FEE_HIGH'),
              coin: fastestFee.coin.toFixed(7),
              amount: (coinCurrencyRate * fastestFee.coin).toFixed(12),
              feeMinTime: feeTime.high.min,
              feeMaxTime: feeTime.high.max
            }];
          } else {
            $scope.items = [{
              id: 0,
              name: $filter('lang')('SEND.FEE_MIN'),
              coin: $scope.sendCoin.minFee.toFixed(7),
              amount: ($scope.sendCoin.minFee * coinCurrencyRate).toFixed(12),
              feeMinTime: '',
              feeMaxTime: ''
            }];
            $scope.item = $scope.dropDown.items[0];
          }
      }, function(data) {
        console.log(data);
      });
    }

    $scope.change = function() {
      if (Object.keys($scope.checkModel).length) {
        $scope.checkedAmountType = $scope.$eval($scope.checkModel.type).name;
        $storage.checkedAmountType = $scope.checkedAmountType;
        $scope.fee = $scope.$eval($scope.checkModel.type).coin;
        $scope.feeCurrency = $scope.$eval($scope.checkModel.type).amount;
        $scope.feeAllText = $scope.fee + ' ' + $scope.coinId;
        $scope.feeCurrencyAllText = $scope.feeCurrency + ' ' + $scope.currency;
      }
    };

    function initCurrencyArray() {
      var currencyArray = [];

      for (var i=0; i < currencyArr.length; i++) {
        currencyArray.push({
          'shortName': currencyArr[i].toUpperCase(),
          'fullName': 'CURRENCY.' + currencyArr[i].toUpperCase(),
          'flagId': currencyArr[i][0].toLowerCase() + currencyArr[i][1].toLowerCase()
        });
      }

      return currencyArray;
    }

    // note: current implementation doesn't permit too often updates
    //       due to possibility of ban for abuse

    $scope.setCurrency = function(item) {
      $scope.activeCurrency = item.shortName;
      $rates.setCurrency($scope.activeCurrency);
      $rates.updateRates(null, null, null, true);
    };

    function initSendCoinModal(balance, coin) {
      $scope.currencyRate = $rates.updateRates(coin, defaultCurrency, true);
      // $scope.initStep = -$scope.initStep;
      $scope.currency = defaultCurrency;
      $scope.coinName = supportedCoinsList[coin].name;
      $scope.coinId = $scope.activeCoin.toUpperCase();
      $scope.coinValue = balance;
      $scope.currencyValue = balance * $scope.currencyRate;

      if (dev && dev.isDev && sendDataTest && sendDataTest[coin]) {
        $scope.sendCoin.address = sendDataTest[coin].address;
        $scope.sendCoin.amount = sendDataTest[coin].val;
        $scope.sendCoin.note = sendDataTest[coin].note;
      }
    }

    function checkFeeCount(fee) {
      var coin = fee * 1024 / 100000000, // satoshi per kb
        amount = $scope.currencyRate * coin;

      return {
        'coin': coin,
        'amount': amount
      };
    }
  }
]);