'use strict';

angular.module('IguanaGUIApp')
.controller('dashboardController', [
  '$scope',
  '$state',
  'util',
  '$passPhraseGenerator',
  '$timeout',
  '$interval',
  '$storage',
  '$uibModal',
  '$api',
  'vars',
  '$rootScope',
  '$filter',
  '$rates',
  '$auth',
  '$message',
  '$datetime',
  '$window',
  function($scope, $state, util, $passPhraseGenerator, $timeout, $interval, $storage, $uibModal,
           $api, vars, $rootScope, $filter, $rates, $auth, $message, $datetime, $window) {
//$storage['iguana-mzc-passphrase'] = { 'logged': 'yes' };
    var coinsInfo = [],
        coinBalances = [],
        _sideBarCoins = {},
        coinsSelectedByUser = [],
        isIguana = $storage.isIguana,
        defaultCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency,
        defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;

    $scope.util = util;
    $scope.$state = $state;
    $scope.isIguana = isIguana;
    $rootScope.$state = $state;
    $scope.enabled = $auth.checkSession(true);
    // TODO: merge all dashboard data into a single object for caching
    $scope.currency = defaultCurrency;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.totalBalance = 0;
    $scope.sideBarCoins = [];
    $scope.txUnit = {
      loading: true,
      activeCoinBalance: 0,
      activeCoinBalanceCurrency: 0,
      transactions: []
    };
    $scope.sideBarCoinsUnsorted = {};
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    $scope.addCoinButtonState = true;
    $scope.disableRemoveCoin = !dev.isDev || isIguana; // dev
    $rootScope.background = false;
    // receive coin updated logic
    $scope.$receiveCoinInstance = {};
    // add coin login modal updated logic
    $scope.passphrase = '';
    $scope.dev = dev;
    $scope.coinsSelectedToAdd = [];
    $scope.$modalInstance = {};
    $scope.receivedObject = undefined;
    // send coin updated logic
    $scope.$sendCoinInstance = {};
    $scope.openAddCoinModal = openAddCoinModal;
    $scope.openAddCoinLoginModal = openAddCoinLoginModal;
    $scope.openReceiveCoinModal = openReceiveCoinModal;
    $scope.openSendCoinModal = openSendCoinModal;
    $scope.setActiveCoin = setActiveCoin;
    $scope.setTxUnitBalance = setTxUnitBalance;
    $scope.removeCoin = removeCoin;
    $scope.getActiveCoins = getActiveCoins;
    $scope.switchLayoutMode = switchLayoutMode;
    $rootScope.$on("$stateChangeStart", stateChangeStart);

    if (!$scope.coinsInfo) {
      constructAccountCoinRepeater(true, true);
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      coinsInfo = vars.coinsInfo;
      checkAddCoinButton();
      constructAccountCoinRepeater(true);
      updateDashboardView(settings.dashboardUpdateTimout);
    }

    var modalInstance = {},
        addCoinModal = {
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          size: 'full',
          controller: 'selectCoinModalController',
          templateUrl: 'partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
        },
        addCoinLoginModal = {
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinLoginModalController',
          templateUrl: 'partials/add-coin-login.html',
          appendTo: angular.element(document.querySelector('.add-coin-login-container')),
          resolve: {
            receivedObject: function() {
              return $scope.receivedObject;
            }
          }
        },
        receiveCoinModal = {
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          size: 'lg',
          controller: 'receiveCoinModalController',
          templateUrl: 'partials/receive-coin.html',
          appendTo: angular.element(document.querySelector('.receive-coin-modal-container'))
        },
        sendCoinModal = {
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'sendCoinModalController',
          templateUrl: 'partials/send-coin.html',
          appendTo: angular.element(document.querySelector('.send-coin-modal-container'))
        };

    // Modals start
    function openAddCoinModal() {
      addCoinModal.resolve = {
        'type': function() {
          return 'signup';
        }
      };

      modalInstance = $uibModal.open(addCoinModal);

      modalInstance.result.then(resultPromise);

      $rootScope.$on('modal.dismissed', resultPromise);

      function resultPromise(event, coins) {
        $scope.receivedObject = util.getCoinKeys(util.reindexAssocArray($scope.getActiveCoins()));

        $auth.login(
          $scope.getActiveCoins(),
          null,
          true
        )
        .then(
          constructAccountCoinRepeater,
          function(reason) {
            console.log('request failed: ', reason);
          });
      }
    }

    function openAddCoinLoginModal() {
      modalInstance = $uibModal.open(addCoinLoginModal);

      modalInstance.result.then(onDone);

      function onDone(receivedObject) {
        if (receivedObject) {
          constructAccountCoinRepeater(); // TODO: fix, not effecient
        }
      }
    }

    function openReceiveCoinModal() {
      modalInstance = $uibModal.open(receiveCoinModal);
    }

    function openSendCoinModal() {
      modalInstance = $uibModal.open(sendCoinModal);
    }
    // Modals end

    function setActiveCoin(item) {
      $storage['iguana-active-coin'] = { id: item.id };
      $scope.activeCoin = item.id;
      $scope.setTxUnitBalance(item);
      constructTransactionUnitRepeater();

      if ($scope.isMobile && $state.current.name === 'dashboard.mobileCoins') {
        $state.go('dashboard.mobileTransactions');
      }
    }

    function setTxUnitBalance(item) {
      $scope.txUnit.activeCoinBalance = item ? item.coinValue : $scope.sideBarCoinsUnsorted[$scope.activeCoin].coinValue;
      $scope.txUnit.activeCoinBalanceCurrency = item ? item.currencyValue : $scope.sideBarCoinsUnsorted[$scope.activeCoin].currencyValue;
    }

    function removeCoin(coinId) {
      if (confirm($filter('lang')('DASHBOARD.ARE_YOU_SURE_YOU_WANT') + ' ' + $scope.sideBarCoinsUnsorted[coinId].name) === true) {
        $storage['iguana-' + coinId + '-passphrase'] = { 'logged': 'no' };

        delete $scope.sideBarCoinsUnsorted[coinId];
        $scope.sideBarCoins = Object.keys($scope.sideBarCoinsUnsorted).map(function(key) {
          return $scope.sideBarCoinsUnsorted[key];
        });

        if ($scope.activeCoin === coinId) {
          $scope.setActiveCoin($scope.sideBarCoins[0]);
        }

        checkAddCoinButton();
        updateTotalBalance();
      }
    }

    function getActiveCoins() {
      return $storage['iguana-login-active-coin'];
    }

    function constructAccountCoinRepeater(isFirstRun, renderNow) {
      var index = 0;

      coinsSelectedByUser = [];

      var lookupArray = coinsInfo && coinsInfo.length ? coinsInfo : supportedCoinsList;
      for (var key in lookupArray) {
        if ($storage['iguana-' + key + '-passphrase'] &&
          $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
          coinsSelectedByUser[index] = key;
          index++;
        }
      }

      if (coinsSelectedByUser.length && !$scope.activeCoin) {
        $scope.activeCoin = coinsSelectedByUser[0];
        $storage['iguana-active-coin'] = { id: $scope.activeCoin };
      }

      coinBalances = [];

      for (var i = 0; i < coinsSelectedByUser.length; i++) {
        if (isFirstRun) {
          _sideBarCoins[coinsSelectedByUser[i]] = {
            id: coinsSelectedByUser[i],
            coinIdUc: coinsSelectedByUser[i].toUpperCase(),
            name: supportedCoinsList[coinsSelectedByUser[i]].name,
            loading: true
          };

          $scope.sideBarCoins = Object.keys(_sideBarCoins).map(function(key) {
            return _sideBarCoins[key];
          });
        }

        if (!renderNow) {
          $api.getBalance(defaultAccount, coinsSelectedByUser[i])
              .then(function(response) {
                constructAccountCoinRepeaterCB(response[0], response[1]);
              }, function(reason) {
                console.log('request failed: ' + reason);
              });
        }
      }
    }

    // construct account coins array
    function constructAccountCoinRepeaterCB(balance, coin) {
      var coinLocalRate = $rates.updateRates(coin.toUpperCase(), defaultCurrency, true) || 0,
          currencyCalculatedValue = balance * coinLocalRate,
          coinBalanceVal = balance || 0,
          coinBalanceCurrencyVal = currencyCalculatedValue || 0;

      coinBalances[coin] = balance;
      _sideBarCoins[coin] = {
        id: coin,
        name: supportedCoinsList[coin].name,
        coinBalanceUnformatted: balance,
        coinValue: coinBalanceVal,
        coinIdUc: coin.toUpperCase(),
        currencyValue: coinBalanceCurrencyVal,
        currencyName: defaultCurrency,
        loading: false
      };

      $scope.sideBarCoins = Object.keys(_sideBarCoins).map(function(key) {
        return _sideBarCoins[key];
      });
      $scope.sideBarCoinsUnsorted = _sideBarCoins;

      // run balances and tx unit update once left sidebar is updated
      if (Object.keys(coinsSelectedByUser).length === Object.keys(coinBalances).length) {
        updateTotalBalance();
        $scope.setTxUnitBalance();
        constructTransactionUnitRepeater();
      }
    }

    function checkAddCoinButton() {
      // disable add wallet/coin button if all coins/wallets are already in the sidebar
      var _coinsLeftToAdd = 0,
          lookupArray = coinsInfo && coinsInfo.length ? coinsInfo : supportedCoinsList;

      for (var key in lookupArray) {
        if (!$storage['iguana-' + key + '-passphrase'] ||
          $storage['iguana-' + key + '-passphrase'] &&
          $storage['iguana-' + key + '-passphrase'].logged !== 'yes') {
          if ((isIguana && coinsInfo[key] && coinsInfo[key].iguana !== false) ||
            (!isIguana && coinsInfo[key] && coinsInfo[key].connection === true)) {
            _coinsLeftToAdd++;
          }
        }
      }

      $scope.addCoinButtonState = _coinsLeftToAdd > 0;
    }

    function updateTotalBalance() {
      var sidebarCoins = $scope.sideBarCoinsUnsorted,
          _totalBalance = 0;

      for (var key in sidebarCoins) {
        var coinLocalRate = $rates.updateRates(key, defaultCurrency, true) || 0;

        _totalBalance += coinLocalRate * sidebarCoins[key].coinBalanceUnformatted;
      }

      $scope.totalBalance = _totalBalance || 0;
    }

    // construct transaction unit array
    function constructTransactionUnitRepeater(update) {
      if (!update) {
        $scope.txUnit.loading = true;
      }

      $scope.txUnit.transactions = []; // TODO: tx unit flickers on active coin change
      $api.listTransactions(defaultAccount, $scope.activeCoin)
          .then(
            constructTransactionUnitRepeaterCB,
            function(reason) {
              console.log('request failed: ' + reason);
            });
    }

    // new tx will appear at the top of the list
    // while old tx are going to be removed from the list
    function constructTransactionUnitRepeaterCB(response) {
      var transactionsList = response,
          decimalPlacesTxUnit = settings.decimalPlacesTxUnit;

      // sort tx in desc order by timestamp
      if (transactionsList) {
        if (transactionsList.length) {
          $scope.txUnit.loading = false;
        }

        for (var i = 0; i < transactionsList.length; i++) {
          $scope.txUnit.transactions[i] = {};

          if (transactionsList[i].txid) {
            // TODO: add func to evaluate tx time in seconds/minutes/hours/a day from now e.g. 'a moment ago', '1 day ago' etc
            // timestamp is converted to 24h format
            var transactionDetails = transactionsList[i],
                txIncomeOrExpenseFlag = '',
                txStatus = 'N/A',
                txCategory = '',
                txAddress = '',
                txAmount = 'N/A',
                iconSentClass = 'bi_interface-minus',
                iconReceivedClass = 'bi_interface-plus';

            if (transactionDetails) {
              if (transactionDetails.details) {
                txAddress = transactionDetails.details[0].address;
                txAmount = transactionDetails.details[0].amount;
                // non-iguana
                if (transactionDetails.details[0].category)
                  txCategory = transactionDetails.details[0].category;

                if (transactionDetails.details[0].category === 'send') {
                  txIncomeOrExpenseFlag = iconSentClass;
                  txStatus = $filter('lang')('DASHBOARD.SENT');
                } else {
                  txIncomeOrExpenseFlag = iconReceivedClass;
                  txStatus = $filter('lang')('DASHBOARD.RECEIVED');
                }
              } else {
                // iguana
                txAddress = transactionsList[i].address || transactionDetails.address;
                txAmount = transactionsList[i].amount;
                txStatus = transactionDetails.category || transactionsList[i].category;
                txCategory = transactionDetails.category || transactionsList[i].category;

                if (txStatus === 'send') {
                  txIncomeOrExpenseFlag = iconSentClass;
                  txStatus = $filter('lang')('DASHBOARD.SENT');
                } else {
                  txIncomeOrExpenseFlag = iconReceivedClass;
                  txStatus = $filter('lang')('DASHBOARD.RECEIVED');
                }
              }

              if (Number(transactionDetails.confirmations) &&
                  Number(transactionDetails.confirmations) < settings.txUnitProgressStatusMinConf) {
                txStatus = $filter('lang')('DASHBOARD.IN_PROCESS');
                txCategory = 'process';
              }

              if (isIguana && txAmount !== undefined || !isIguana) {
                $scope.txUnit.transactions[i].txId = transactionDetails.txid;
              }

              $scope.txUnit.transactions[i].status = txStatus;
              $scope.txUnit.transactions[i].statusClass = transactionDetails.confirmations ? txCategory : 'process';
              $scope.txUnit.transactions[i].confs = transactionDetails.confirmations ? transactionDetails.confirmations : 'n/a';
              $scope.txUnit.transactions[i].inOut = txIncomeOrExpenseFlag;
              $scope.txUnit.transactions[i].amount = txAmount > 0 ? Math.abs(txAmount.toFixed(decimalPlacesTxUnit)) : Math.abs(txAmount);
              $scope.txUnit.transactions[i].timestampFormat = 'timestamp-multi';
              $scope.txUnit.transactions[i].coin = $scope.activeCoin.toUpperCase();
              $scope.txUnit.transactions[i].hash = txAddress !== undefined ? txAddress : 'N/A';

              if (txAmount) {
                // mobile only
                $scope.txUnit.transactions[i].switchStyle = txAmount.toString().length > 8;
              }

              $scope.txUnit.transactions[i].timestampUnchanged = transactionDetails.blocktime ||
                transactionDetails.timestamp ||
                transactionDetails.time;
              $scope.txUnit.transactions[i].timestampDate = $datetime.convertUnixTime(transactionDetails.blocktime ||
                transactionDetails.timestamp ||
                transactionDetails.time, 'DDMMMYYYY');
              $scope.txUnit.transactions[i].timestampTime = $datetime.convertUnixTime(transactionDetails.blocktime ||
                transactionDetails.timestamp ||
                transactionDetails.time, 'HHMM');
            }
          }
        }
      }
    }

    function updateDashboardView(timeout) {
      vars.dashboardUpdateRef = $interval(function() {
        // console.clear();
        $auth.checkSession();
        $rates.updateRates(null, null, null, true);
        constructAccountCoinRepeater();

        if (dev.showConsoleMessages && dev.isDev) console.log('dashboard updated');
      }, timeout * 1000);
    }

    function stateChangeStart() {
      $interval.cancel(vars.dashboardUpdateRef);
    }

    function switchLayoutMode() {
      if ($scope.isMobile && $state.current.name === 'dashboard.main' &&
          $state.current.name !== 'dashboard.mobileTransactions') {
        $state.go('dashboard.mobileCoins');
      }
      if (!$scope.isMobile && $state.current.name !== 'dashboard.main') {
        $state.go('dashboard.main');
      }
    }
  }
]);