'use strict';

angular.module('IguanaGUIApp')
.controller('settingsController', [
  '$scope',
  '$state',
  '$rates',
  '$auth',
  '$rootScope',
  '$storage',
  '$timeout',
  '$api',
  'vars',
  '$filter',
  'util',
  function($scope, $state, $rates, $auth, $rootScope, $storage,
           $timeout, $api, vars, $filter, util) {
    $scope.$state = $state;
    $rootScope.$state = $state;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.checkedAmountType = $storage.checkedAmountType ? $storage.checkedAmountType : $storage.checkedAmountType = $filter('lang')('SEND.FEE_MIN');
    $scope.enabled = $auth.checkSession(true);
    $scope.activeCoin = util.getActiveCoin();
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
      defaultCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency,
      controllerIntervals;

    $scope.currencyArr = initCurrencyArray();
    $scope.activeCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency;

    $scope.karma = { // tests
      onInit: onInit,
      initCurrencyArray: initCurrencyArray,
      currencyArr: currencyArr
    };

    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      $scope.sendCoin = {
        minFee: vars.coinsInfo[$scope.activeCoin].relayFee || settings.defaultRelayFee
      };

      var currencyName = $rates.getCurrency() ? $rates.getCurrency().name : settings.defaultCurrency,
        coinName = $storage['iguana-active-coin']['id'].toUpperCase();

      $api.feeCoins(
        $scope.activeCoin,
        defaultAccount,
        currencyName,
        coinName
      )
        .then(
          function(result) {
            var fastestFee = checkFeeCount(result.bitcoinFees.data.fastestFee),
              halfHourFee = checkFeeCount(result.bitcoinFees.data.halfHourFee),
              hourFee = checkFeeCount(result.bitcoinFees.data.hourFee),
              coinCurrencyRate = result.getExternalRate[0][coinName][currencyName],
              feeTime = {
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
            // default to min fee if altcoin is used
            if (coinName !== 'BTC') $scope.checkedAmountType = $filter('lang')('SEND.FEE_MIN');

            $scope.items = [{
              id: 0,
              name: $filter('lang')('SEND.FEE_MIN'),
              coin: $scope.sendCoin.minFee.toFixed(7),
              amount: (coinCurrencyRate * $scope.sendCoin.minFee).toFixed(12),
              feeMinTime: feeTime.default.min,
              feeMaxTime: feeTime.default.max,
              state: 'enabled'
            }, {
              id: 1,
              name: $filter('lang')('SEND.FEE_LOW'),
              coin: hourFee.coin.toFixed(7),
              amount: (coinCurrencyRate * hourFee.coin).toFixed(12),
              feeMinTime: feeTime.low.min,
              feeMaxTime: feeTime.low.max,
              state: coinName === 'BTC' ? 'enabled' : 'disabled'
            }, {
              id: 2,
              name: $filter('lang')('SEND.FEE_NORMAL'),
              coin: halfHourFee.coin.toFixed(7),
              amount: (coinCurrencyRate * halfHourFee.coin).toFixed(12),
              feeMinTime: feeTime.normal.min,
              feeMaxTime: feeTime.normal.max,
              state: coinName === 'BTC' ? 'enabled' : 'disabled'
            }, {
              id: 3,
              name: $filter('lang')('SEND.FEE_HIGH'),
              coin: fastestFee.coin.toFixed(7),
              amount: (coinCurrencyRate * fastestFee.coin).toFixed(12),
              feeMinTime: feeTime.high.min,
              feeMaxTime: feeTime.high.max,
              state: coinName === 'BTC' ? 'enabled' : 'disabled'
            }];
            updateCtrl();
          },
          function(data) {
            if (dev.showConsoleMessages && dev.isDev) {
              console.log(data);
            }
            updateCtrl();
          }
        );
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

    function checkFeeCount(fee) {
      return util.checkFeeCount(fee, $scope.currencyRate);
    }

    function updateCtrl() {
      $timeout.cancel(controllerIntervals);
      controllerIntervals = $timeout(function() {
        onInit();
      }, $datetime.minuteMilliSec(settings.apiCheckTimeout));
    }
  }
]);