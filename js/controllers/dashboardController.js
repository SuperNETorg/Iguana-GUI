'use strict';

angular.module('IguanaGUIApp')
.controller('dashboardController', ['$scope', '$http', '$state', 'util', '$passPhraseGenerator',
  '$timeout', '$interval', '$storage', '$uibModal', '$api', 'vars', 'helper', '$rootScope', '$filter', '$rates', '$auth', '$message', '$datetime',
  function($scope, $http, $state, util, $passPhraseGenerator, $timeout, $interval, $storage, $uibModal,
    $api, vars, helper, $rootScope, $filter, $rates, $auth, $message, $datetime) {
    var isIguana = $storage['isIguana'],
        coinsInfo = [];

    $rootScope.$on('getCoin', function ($ev, coins) {
      coinsInfo = vars.coinsInfo;
      constructAccountCoinRepeater();
    });

    $scope.util = util;
    $scope.$state = $state;
    $scope.isIguana = isIguana;
    $scope.enabled = $auth.checkSession(true);

    // add coin login modal updated logic
    $scope.passphrase = '';
    $scope.dev = dev;
    $scope.coinsSelectedToAdd = [];
    $scope.$modalInstance = {};
    $scope.receivedObject = undefined;

    $scope.openAddCoinLoginModal = function () {
      var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'addCoinLoginModalController',
            templateUrl: '/partials/add-coin-login.html',
            appendTo: angular.element(document.querySelector('.add-coin-login-container')),
            resolve: {
              receivedObject: function () {
                return $scope.receivedObject;
              }
            }
          });
      modalInstance.result.then(onDone);

      function onDone(receivedObject) {
        if (receivedObject.length > 1) {
          $storage['iguana-' + receivedObject + '-passphrase'] = { 'logged': 'yes' };
          constructAccountCoinRepeater(); // TODO: fix, not effecient
        }
      }
    };

    // receive coin updated logic
    $scope.$receiveCoinInstance = {};

    $scope.openReceiveCoinModal = function () {
      var receiveCoinInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'receiveCoinModalController',
            templateUrl: '/partials/receive-coin.html',
            appendTo: angular.element(document.querySelector('.receive-coin-modal-container')),
          });
    };

    $scope.timeAgo = function (element) {
      $datetime.timeAgo(element);
    };

    // send coin updated logic
    $scope.$sendCoinInstance = {};

    $scope.openSendCoinModal = function () {
      var sendCoinInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'sendCoinModalController',
            templateUrl: '/partials/send-coin.html',
            appendTo: angular.element(document.querySelector('.send-coin-modal-container')),
          });
    };

    var defaultCurrency = $rates.getCurrency() ? $rates.getCurrency().name : null || settings.defaultCurrency,
        defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;

    $('body').addClass('dashboard-page');

    $(document).ready(function() {
      util.initTopNavBar();

      $('body').scroll(function(e){
        if ($(window).width() < 768) {
          if ($('.main-content,.currency-content').position().top  < -270) {
            $('#top-menu').addClass('hidden');
          } else {
            $('#top-menu').removeClass('hidden');
          }
        }
      })
      updateDashboardView(settings.ratesUpdateTimeout);
    });

    $(window).resize(function() {
      util.applyDashboardResizeFix($scope.sideBarCoins);
    });

    $scope.$on('$viewContentLoaded', function(event) {
      if (vars.coinsInfo && Object.keys(vars.coinsInfo).length) {
        coinsInfo = vars.coinsInfo;
        constructAccountCoinRepeater(true);
      }
    });

    // TODO: merge all dashboard data into a single object for caching
    $scope.currency = defaultCurrency;
    $scope.totalBalance = 0;
    $scope.sideBarCoins;
    $scope.txUnit = {
      loading: true,
      activeCoinBalance: 0,
      activeCoinBalanceCurrency: 0,
      transactions: []
    };
    $scope.sideBarCoinsUnsorted = {};
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    $scope.addCoinButtonState = true;
    $scope.disableRemoveCoin = dev.isDev && !isIguana ? false : true; // dev

    var coinBalances = [],
        _sideBarCoins = {},
        coinsSelectedByUser = [],
        dashboardUpdateTimer;

    $scope.setActiveCoin = function(item) {
      $storage['iguana-active-coin'] = { id: item.id };
      $scope.activeCoin = item.id;
      $scope.setTxUnitBalance(item);
      constructTransactionUnitRepeater();
    }

    $scope.setTxUnitBalance = function(item) {
      $scope.txUnit.activeCoinBalance = item ? item.coinValue : $scope.sideBarCoinsUnsorted[$scope.activeCoin].coinValue;
      $scope.txUnit.activeCoinBalanceCurrency = item ? item.currencyValue : $scope.sideBarCoinsUnsorted[$scope.activeCoin].currencyValue;
    }

    $scope.removeCoin = function(coinId) {
      if (confirm($filter('lang')('DASHBOARD.ARE_YOU_SURE_YOU_WANT') + ' ' + $scope.sideBarCoinsUnsorted[coinId].name) === true) {
        $storage['iguana-' + coinId + '-passphrase'] = { 'logged': 'no' };

        delete $scope.sideBarCoinsUnsorted[coinId];
        $scope.sideBarCoins = Object.keys($scope.sideBarCoinsUnsorted).map(function(key) {
          return $scope.sideBarCoinsUnsorted[key];
        });

        if ($scope.activeCoin === coinId) $scope.setActiveCoin($scope.sideBarCoins[0]);
        checkAddCoinButton();
        updateTotalBalance();
      }
    }

    //api.checkBackEndConnectionStatus();
    //applyDashboardResizeFix();

    function constructAccountCoinRepeater(isFirstRun) {
      var index = 0;

      coinsSelectedByUser = [];

      for (var key in coinsInfo) {
        if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
          coinsSelectedByUser[index] = key;
          index++;
        }
      }

      if (coinsSelectedByUser.length && !$scope.activeCoin) $scope.activeCoin = coinsSelectedByUser[0];

      coinBalances = [];

      for (var i=0; i <coinsSelectedByUser.length; i++) {
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
        util.applyDashboardResizeFix($scope.sideBarCoins);
        $api.getBalance(defaultAccount, coinsSelectedByUser[i], constructAccountCoinRepeaterCB);
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

      util.applyDashboardResizeFix($scope.sideBarCoins);

      // run balances and tx unit update once left sidebar is updated
      if (Object.keys(coinsSelectedByUser).length === Object.keys(coinBalances).length) {
        checkAddCoinButton();
        updateTotalBalance();
        $scope.setTxUnitBalance();
        constructTransactionUnitRepeater();
      }
    }

    // TODO: watch coinsInfo, checkAddCoinButton and connectivity status

    function checkAddCoinButton() {
      // disable add wallet/coin button if all coins/wallets are already in the sidebar
      var _coinsLeftToAdd = 0;
      for (var key in supportedCoinsList) {
        if (!$storage['iguana-' + key + '-passphrase'] || $storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged !== 'yes') {
          if ((isIguana && coinsInfo[key].iguana !== false) || (!isIguana && coinsInfo[key].connection === true)) {
            _coinsLeftToAdd++;
          }
        }
      }
      //$scope.addCoinButtonState = _coinsLeftToAdd > 0 ? true : false; // TODO: fix, breaks on portpoll
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
      if (!update) $scope.txUnit.loading = true;

      $scope.txUnit.transactions = []; // TODO: tx unit flickers on active coin change
      $api.listTransactions(defaultAccount, $scope.activeCoin, constructTransactionUnitRepeaterCB);
    }

    // new tx will appear at the top of the list
    // while old tx are going to be removed from the list
    function constructTransactionUnitRepeaterCB(response) {
      var transactionsList = response,
          decimalPlacesTxUnit = settings.decimalPlacesTxUnit;
      // sort tx in desc order by timestamp
      if (transactionsList) {
        if (transactionsList.length) $scope.txUnit.loading = false;
        for (var i=0; i < transactionsList.length; i++) {
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

            if (transactionDetails)
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

            if (transactionDetails) {
              if (Number(transactionDetails.confirmations) && Number(transactionDetails.confirmations) < settings.txUnitProgressStatusMinConf) {
                txStatus = $filter('lang')('DASHBOARD.IN_PROCESS');
                txCategory = 'process';
              }
              if (isIguana && txAmount !== undefined || !isIguana)
                $scope.txUnit.transactions[i].txId = transactionDetails.txid;
                $scope.txUnit.transactions[i].status = txStatus;
                $scope.txUnit.transactions[i].statusClass = txCategory;
                $scope.txUnit.transactions[i].confs = transactionDetails.confirmations ? transactionDetails.confirmations : 'n/a';
                $scope.txUnit.transactions[i].inOut = txIncomeOrExpenseFlag;
                $scope.txUnit.transactions[i].amount = txAmount > 0 ? Math.abs(txAmount.toFixed(decimalPlacesTxUnit)) : Math.abs(txAmount);
                $scope.txUnit.transactions[i].timestampFormat = 'timestamp-multi';
                $scope.txUnit.transactions[i].coin = $scope.activeCoin.toUpperCase();
                $scope.txUnit.transactions[i].hash = txAddress !== undefined ? txAddress : 'N/A';
                $scope.txUnit.transactions[i].switchStyle = (txAmount.toString().length > 8 ? true : false); // mobile only
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

      util.applyDashboardResizeFix($scope.sideBarCoins);
    }

    function updateDashboardView(timeout) {
      dashboardUpdateTimer = $interval(function() {
        //console.clear();
        $auth.checkSession();
        $rates.updateRates(null, null, null, true);
        constructAccountCoinRepeater();

        if (dev.showConsoleMessages && dev.isDev) console.log('dashboard updated');
      }, timeout * 1000);
    }

    /*
     *  add coin modal
     */
    // TODO: move to service
    $scope.toggleAddCoinWalletCreateModal = function(initOnly) {
      $scope.addCoinCreateAccount = {
        passphrase: $passPhraseGenerator.generatePassPhrase(isIguana ? 8 : 4),
        wordCount: 12,
        passphraseSavedCheckbox: false,
        passphraseVerify: '',
        initStep: true,
        copyToClipboardNotSupported: false
      };

      if (!initOnly) helper.toggleModalWindow('add-coin-create-wallet-form', 300);
    }

    $scope.copyPassphrase = function() {
      $scope.addCoinCreateAccount.copyToClipboardNotSupported = helper.addCopyToClipboardFromElement('.generated-passhprase', $filter('lang')('LOGIN.PASSPHRASE'));
    }

    $scope.encryptCoindWallet = function() {
      encryptCoindWallet();
    }

    function encryptCoindWallet(modalClassName) {
      var addCoinCreateWalletModalClassName = 'add-coin-create-wallet-form';

      var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);

      if ($scope.addCoinCreateAccount.passphrase === $scope.addCoinCreateAccount.passphraseVerify) {
        var walletEncryptResponse = $api.walletEncrypt($scope.addCoinCreateAccount, coinsSelectedToAdd[0]);

        if (walletEncryptResponse !== -15) {
          helper.toggleModalWindow(addCoinCreateWalletModalClassName, 300);
          $message.ngPrepMessageModal(supportedCoinsList[coinsSelectedToAdd[0]].name + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'), 'green', true);
        } else {
          helper.toggleModalWindow(addCoinCreateWalletModalClassName, 300);
          $message.ngPrepMessageModal($filter('lang')('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'), 'red', true);
        }
      } else {
        $message.ngPrepMessageModal($filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'), 'red', true);
      }
    }

    $scope.addCoinNext = function() {
      if (!isIguana) {
        helper.toggleModalWindow('add-new-coin-form', 300);
        var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);

        // dev only
        if (dev.isDev && !isIguana && dev.coinPW.coind[coinsSelectedToAdd[0]]) $scope.passphrase = dev.coinPW.coind[coinsSelectedToAdd[0]];
        if (dev.isDev && isIguana && dev.coinPW.iguana) $scope.passphrase = dev.coinPW.iguana;
      } else {
        coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

        for (var i=0; i < coinsSelectedToAdd.length; i++) {
          if (coinsSelectedToAdd[i]) {
            (function(x) {
              $timeout(function() {
                $api.addCoin(coinsSelectedToAdd[x], addCoinDashboardCB);
              }, x === 0 ? 0 : settings.addCoinTimeout * 1000);
            })(i);
          }
        }
      }
    }

    function addCoinDashboardCB(response, coin) {
      if (response === 'coin added' || response === 'coin already there') {
        if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coin + ' coin added<br/>');

        addCoinResponses.push({ 'coin': coin, 'response': response });
        coinsInfo[coin].connection = true; // update coins info obj prior to scheduled port poll
      }

      var addedCoinsOutput = '',
          failedCoinsOutput = '<br/>';
      for (var i=0; i < Object.keys(addCoinResponses).length; i++) {
        if (addCoinResponses[i].response === 'coin added' || addCoinResponses[i].response === 'coin already there') {
          addedCoinsOutput = addedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
          $storage['iguana-' + addCoinResponses[i].coin + '-passphrase'] = { 'logged': 'yes' };
        } else {
          failedCoinsOutput = failedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
        }
      }
      addedCoinsOutput = helper.trimComma(addedCoinsOutput);
      failedCoinsOutput = helper.trimComma(failedCoinsOutput);

      $message.ngPrepMessageModal(addedCoinsOutput + ' ' + $filter('lang')('MESSAGE.COIN_ADD_P1') + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' ' + $filter('lang')('MESSAGE.COIN_ADD_P2') : ''), 'green', true);
    }
}]);