'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('dashboardController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;
    $scope.$state = $state;
    $scope.isIguana = isIguana;
    $scope.receiveCoin = { address: '', qrCode: '' }

    var defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency,
        defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;

    $('body').addClass('dashboard-page');

    $scope.checkSession = function() {
      if (!helper.checkSession(true)) {
        $state.go('login');
      }
    }

    $scope.checkSession();

    $scope.logout = function() {
      helper.logout();
      $scope.checkSession();
    }

    $(document).ready(function() {
      api.testConnection();
      //updateDashboardView(settings.ratesUpdateTimeout);
    });

    // TODO: merge all dashboard data into a single object for caching
    $scope.currency = defaultCurrency;
    $scope.totalBalance = 0;
    $scope.sideBarCoins;
    $scope.txUnit = { 'loading': true, activeCoinBalance: 0, activeCoinBalanceCurrency: 0, transactions: [] };
    $scope.sideBarCoinsUnsorted = {};
    $scope.activeCoin = localstorage.getVal('iguana-active-coin') && localstorage.getVal('iguana-active-coin').id ? localstorage.getVal('iguana-active-coin').id : 0;
    $scope.addCoinButtonState = true;
    $scope.disableRemoveCoin = dev.isDev && !isIguana ? false : true; // dev

    var coinBalances = [],
        _sideBarCoins = {},
        coinsSelectedByUser = [],
        dashboardUpdateTimer;

    constructAccountCoinRepeater(true);

    $scope.setActiveCoin = function(item) {
      localstorage.setVal('iguana-active-coin', { id: item.id });
      $scope.activeCoin = item.id;
      $scope.setTxUnitBalance(item);
      constructTransactionUnitRepeater();
      getReceiveCoinAddress();
    }

    $scope.setTxUnitBalance = function(item) {
      $scope.txUnit.activeCoinBalance = item ? item.coinValue : $scope.sideBarCoinsUnsorted[$scope.activeCoin].coinValue;
      $scope.txUnit.activeCoinBalanceCurrency = item ? item.currencyValue : $scope.sideBarCoinsUnsorted[$scope.activeCoin].currencyValue;
    }

    $scope.removeCoin = function(coinId) {
      if (confirm(helper.lang('DASHBOARD.ARE_YOU_SURE_YOU_WANT') + ' ' + $scope.sideBarCoinsUnsorted[coinId].name) === true) {
        localstorage.setVal('iguana-' + coinId + '-passphrase', { 'logged': 'no' });

        delete $scope.sideBarCoinsUnsorted[coinId];
        $scope.sideBarCoins = Object.keys($scope.sideBarCoinsUnsorted).map(function(key) {
          return $scope.sideBarCoinsUnsorted[key];
        });

        if ($scope.activeCoin === coinId) $scope.setActiveCoin($scope.sideBarCoins[0]);
        checkAddCoinButton();
      }
    }

    //api.checkBackEndConnectionStatus();
    //applyDashboardResizeFix();

    function constructAccountCoinRepeater(isFirstRun) {
      var index = 0;

      coinsSelectedByUser = [];

      for (var key in coinsInfo) {
        if ((isIguana && localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
            (!isIguana && localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
          coinsSelectedByUser[index] = key;
          index++;
        }
      }

      if (coinsSelectedByUser.length && !$scope.activeCoin) $scope.activeCoin = coinsSelectedByUser[0];

      coinBalances = [];

      for (var i=0; i < coinsSelectedByUser.length; i++) {
        if (isFirstRun) {
          _sideBarCoins[coinsSelectedByUser[i]] = { id: coinsSelectedByUser[i], name: supportedCoinsList[coinsSelectedByUser[i]].name, loading: true };

          $scope.sideBarCoins = Object.keys(_sideBarCoins).map(function(key) {
            return _sideBarCoins[key];
          });
        }
        applyDashboardResizeFix();
        api.getBalance(defaultAccount, coinsSelectedByUser[i], constructAccountCoinRepeaterCB);
      }
    }

    // construct account coins array
    function constructAccountCoinRepeaterCB(balance, coin) {
      var coinLocalRate = helper.updateRates(coin.toUpperCase(), defaultCurrency, true) || 0,
          currencyCalculatedValue = balance * coinLocalRate,
          coinBalanceVal = balance ? balance.toFixed(helper.decimalPlacesFormat(balance).coin) : 0,
          coinBalanceCurrencyVal = currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency);

      coinBalances[coin] = balance;
      var coinLoading = true;
      if (coinsInfo[coin].connection === true && coinsInfo[coin].RT === true) {
        coinLoading = false;
      }
      _sideBarCoins[coin] = { id: coin,
                              name: supportedCoinsList[coin].name,
                              coinBalanceUnformatted: balance,
                              coinValue: coinBalanceVal,
                              coinIdUc: coin.toUpperCase(),
                              currencyValue: coinBalanceCurrencyVal,
                              currencyName: defaultCurrency,
                              loading: false };

      $scope.sideBarCoins = Object.keys(_sideBarCoins).map(function(key) {
        return _sideBarCoins[key];
      });
      $scope.sideBarCoinsUnsorted = _sideBarCoins;

      // run balances and tx unit update once left sidebar is updated
      if (Object.keys(coinsSelectedByUser).length === Object.keys(coinBalances).length) {
        checkAddCoinButton();
        updateTotalBalance();
        $scope.setTxUnitBalance();
        constructTransactionUnitRepeater();
        applyDashboardResizeFix();
      }
    }

    // TODO: watch coinsInfo, checkAddCoinButton and connectivity status

    function checkAddCoinButton() {
      // disable add wallet/coin button if all coins/wallets are already in the sidebar
      var _coinsLeftToAdd = 0;
      for (var key in supportedCoinsList) {
        if (!localstorage.getVal('iguana-' + key + '-passphrase') || (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes')) {
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
        var coinLocalRate = helper.updateRates(key, defaultCurrency, true) || 0;
        _totalBalance += coinLocalRate * sidebarCoins[key].coinBalanceUnformatted;
      }

      var totalBalanceDecimals = helper.decimalPlacesFormat(_totalBalance).currency;
      $scope.totalBalance = _totalBalance.toFixed(totalBalanceDecimals) !== 'NaN' ? _totalBalance.toFixed(totalBalanceDecimals) : 0.00;
    }

    // construct transaction unit array
    function constructTransactionUnitRepeater(update) {
      if (!update) $scope.txUnit.loading = true;

      $scope.txUnit.transactions = []; // TODO: tx unit flickers on active coin change
      api.listTransactions(defaultAccount, $scope.activeCoin, constructTransactionUnitRepeaterCB);
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
                    txStatus = helper.lang('DASHBOARD.SENT');
                  } else {
                    txIncomeOrExpenseFlag = iconReceivedClass;
                    txStatus = helper.lang('DASHBOARD.RECEIVED');
                  }
              } else {
                // iguana
                txAddress = transactionsList[i].address || transactionDetails.address;
                txAmount = transactionsList[i].amount;
                txStatus = transactionDetails.category || transactionsList[i].category;
                txCategory = transactionDetails.category || transactionsList[i].category;

                if (txStatus === 'send') {
                  txIncomeOrExpenseFlag = iconSentClass;
                  txStatus = helper.lang('DASHBOARD.SENT');
                } else {
                  txIncomeOrExpenseFlag = iconReceivedClass;
                  txStatus = helper.lang('DASHBOARD.RECEIVED');
                }
              }

            if (transactionDetails) {
              if (Number(transactionDetails.confirmations) && Number(transactionDetails.confirmations) < settings.txUnitProgressStatusMinConf) {
                txStatus = helper.lang('DASHBOARD.IN_PROCESS');
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
                $scope.txUnit.transactions[i].timestampUnchanged = transactionDetails.blocktime ||
                                                                   transactionDetails.timestamp ||
                                                                   transactionDetails.time;
                $scope.txUnit.transactions[i].timestampDate = helper.convertUnixTime(transactionDetails.blocktime ||
                                                                                transactionDetails.timestamp ||
                                                                                transactionDetails.time, 'DDMMMYYYY');
                $scope.txUnit.transactions[i].timestampTime = helper.convertUnixTime(transactionDetails.blocktime ||
                                                                                transactionDetails.timestamp ||
                                                                                transactionDetails.time, 'HHMM');
            }
          }
        }
      }

      $scope.$apply(); // manually trigger digest
    }

    // not the best solution but it works
    function applyDashboardResizeFix() {
      var mainContent = $('.main-content'),
          txUnit = $('.transactions-unit');
      // tx unit resize
      if ($(window).width() > 767) {
        var width = Math.floor(mainContent.width() - $('.coins').width() - 80);
        mainContent.css({ 'padding': '0 30px' });
        txUnit.css({ 'max-width': width, 'width': width });
      } else {
        txUnit.removeAttr('style');
        mainContent.removeAttr('style');
      }
      // hash shading
      var txUnitItem = '.transactions-list-repeater .item';
      $(txUnitItem + ' .hash').css({ 'width': Math.floor($('.transactions-list-repeater').width() / 1.4 -
                                                                             $(txUnitItem + ':first-child .status').width() -
                                                                             $(txUnitItem + ':first-child .amount').width() -
                                                                             $(txUnitItem + ':first-child .progress-status').width()) });
      // coin tiles on the left
      var accountCoinsRepeaterItem = '.account-coins-repeater .item';
      $(accountCoinsRepeaterItem).each(function(index, item) {
        var coin = $(this).attr('data-coin-id');
        $(accountCoinsRepeaterItem + coin + ' .coin .name').css({ 'width': Math.floor($(accountCoinsRepeaterItem + coin).width() -
                                                                                      $(accountCoinsRepeaterItem + coin + ' .coin .icon').width() -
                                                                                      $(accountCoinsRepeaterItem + coin + ' .balance').width() - 50) });
      });
      //opacityToggleOnAddCoinRepeaterScroll();
    }

    function updateDashboardView(timeout) {
      dashboardUpdateTimer = setInterval(function() {
        //console.clear();
        helper.checkSession();
        helper.updateRates(null, null, null, true);
        constructTransactionUnitRepeater(true);

        if (dev.showConsoleMessages && dev.isDev) console.log('dashboard updated');
      }, timeout * 1000);
    }

    /*
     *  add coin modal
     */
    // TODO: move to service
    $scope.passphrase = '';
    $scope.coinsSelectedToAdd = {};

    $scope.toggleLoginModal = function() {
      helper.toggleModalWindow('add-coin-login-form', 300);
    }

    $scope.toggleAddCoinModal = function() {
      var availableCoins = helper.addCoinButtonCB();
      $scope.availableCoins = availableCoins;
      $scope.wordCount = isIguana ? 24 : 12; // TODO: move to settings

      /* legacy, seems to work fine */
      helper.opacityToggleOnAddCoinRepeaterScroll();
      $('.supported-coins-repeater').scroll(function(e) {
        helper.opacityToggleOnAddCoinRepeaterScroll();
      });
      helper.bindCoinRepeaterSearch();
    }

    $scope.objLen = function(obj) {
      return Object.keys(obj).length;
    }

    $scope.toggleCoinTile = function(item) {
      if (!isIguana) {
        $scope.coinsSelectedToAdd = {};
      }

      if ($scope.coinsSelectedToAdd[item.coinId]) {
        delete $scope.coinsSelectedToAdd[item.coinId];
      } else {
        $scope.coinsSelectedToAdd[item.coinId] = true;
      }
    }

    $scope.toggleAddCoinWalletCreateModal = function() {

    }

    $scope.loginWallet = function() {
      // coind
      var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);
      api.walletLock(coinsSelectedToAdd[0]);
      var walletLogin = api.walletLogin($scope.passphrase, settings.defaultSessionLifetime, coinsSelectedToAdd[0]);

      console.log(walletLogin);
      if (walletLogin !== -14 && walletLogin !== -15) {
        localstorage.setVal('iguana-' + coinsSelectedToAdd[0] + '-passphrase', { 'logged': 'yes' });
        helper.updateRates(null, null, null, true);
        constructAccountCoinRepeater();
        $scope.toggleLoginModal();
      }
      if (walletLogin === -14) {
        helper.prepMessageModal(helper.lang('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
      }
      if (walletLogin === -15) {
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'), 'red', true);
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
              setTimeout(function() {
                api.addCoin(coinsSelectedToAdd[x], addCoinDashboardCB);
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
          localstorage.setVal('iguana-' + addCoinResponses[i].coin + '-passphrase', { 'logged': 'yes' });
        } else {
          failedCoinsOutput = failedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
        }
      }
      addedCoinsOutput = helper.trimComma(addedCoinsOutput);
      failedCoinsOutput = helper.trimComma(failedCoinsOutput);

      helper.prepMessageModal(addedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P1') + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P2') : ''), 'green', true);
    }

    /*
     *  receive coin modal
     */
    // TODO: directive
    // TODO(?): add syscoin:coinaddresshere?amount=0.10000000&label=123&message=123
    $scope.sendCoinKeying = function() { // !! ugly !!
      var coinRate,
          coin = $scope.activeCoin ? $scope.activeCoin : localstorage.getVal('iguana-active-coin') && localstorage.getVal('iguana-active-coin').id ? localstorage.getVal('iguana-active-coin').id : 0,
          currencyCoin = $('.currency-coin'),
          currencyObj = $('.currency');

      var localrates = JSON.parse(localstorage.getVal("iguana-rates" + coin.toUpperCase()));
      coinRate = helper.updateRates(coin, defaultCurrency, true);

      currencyCoin.on('keyup', function () {
        var calcAmount = $(this).val() * coinRate;
        currencyObj.val(calcAmount.toFixed(helper.decimalPlacesFormat(calcAmount).currency));
      });

      currencyObj.on('keyup', function () {
        var calcAmount = $(this).val() / coinRate;
        currencyCoin.val(calcAmount.toFixed(helper.decimalPlacesFormat(calcAmount).currency));
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

    $scope.getReceiveCoinAddress = function() {
      getReceiveCoinAddress();
    }

    function getReceiveCoinAddress() {
      var _activeCoin = $scope.activeCoin ? $scope.activeCoin : localstorage.getVal('iguana-active-coin') && localstorage.getVal('iguana-active-coin').id ? localstorage.getVal('iguana-active-coin').id : 0;
      var coinAccountAddress = api.getAccountAddress(_activeCoin, defaultAccount);
      $scope.receiveCoin.coinName = _activeCoin.toUpperCase();
      $scope.receiveCoin.currencyName = defaultCurrency.toUpperCase();
      $scope.receiveCoin.address = coinAccountAddress;
      $scope.receiveCoin.addressFormatted = $scope.receiveCoin.address.match(/.{1,4}/g).join(' ')
      $scope.receiveCoin.qrCode = $(kjua({ text: coinAccountAddress })).attr('src');
      $scope.receiveCoin.shareUrl = 'mailto:?subject=Here%20is%20my%20' + supportedCoinsList[_activeCoin].name + '%20address' +
                                    '&body=Hello,%20here%20is%20my%20' + supportedCoinsList[_activeCoin].name + '%20address%20' + coinAccountAddress;
    }

    $scope.copyToClipboard = function() {
      var temp = $('<input>');

      $('body').append(temp);
      //remove spaces from address
      temp.val($('#address').text().replace(/ /g, '')).select();

      try {
        helper.prepMessageModal(helper.lang('MESSAGE.ADDRESS_IS_COPIED'), 'blue', true);
        document.execCommand('copy');
      } catch(err) {
        helper.prepMessageModal(helper.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED_ADDRESS'), 'red', true);
      }

      temp.remove();
    }
    /*function bindReceive() {
      var coinRate,
          coin = activeCoin || $('.account-coins-repeater .item.active').attr('data-coin-id'),
          address = api.getAccountAddress(coin, defaultAccount),
          currencyCoin = $('.currency-coin'),
          currencyObj = $('.currency');

      currencyCoin.val('');
      currencyObj.val('');
      localrates = JSON.parse(localstorage.getVal("iguana-rates" + coin.toUpperCase()));
      $('.coin-unit').text(coin.toUpperCase());
      coinRate = updateRates(coin, defaultCurrency, true);

      if (address.length === 34) {
        var splittedAddress = address.match(/.{1,4}/g).join(' ');
        $('#address').text(splittedAddress);
      }

      $('.unit-currency').html(defaultCurrency);
      $('.enter-in-currency').html(helper.lang('RECEIVE.ENTER_IN') + ' ' + coin.toUpperCase() + ' ' + helper.lang('LOGIN.OR') + ' ' + defaultCurrency);



      $('#qr-code').empty().
                    qrcode(address);

      $('.btn-share-email').attr('href', 'mailto:?subject=Here%20is%20my%20' + supportedCoinsList[coin].name + '%20address' +
                                         '&body=Hello,%20here%20is%20my%20' + supportedCoinsList[coin].name + '%20address%20' + address);
    }*/

    /*function initDashboard() {
      if (localstorage.getVal('iguana-active-coin') && localstorage.getVal('iguana-active-coin').id) activeCoin = localstorage.getVal('iguana-active-coin').id;

      defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;

      // load templates
      if (!isIguana) {
        templates.all.addCoin = templates.all.addCoin.replace(helper.lang('ADD_COIN.ADDING_A_NEW_COIN'), helper.lang('DASHBOARD.ADDING_A_NEW_WALLET')).
                                              replace(helper.lang('ADD_COIN.SELECT_COINS_TO_ADD'), helper.lang('DASHBOARD.SELECT_A_WALLET_TO_ADD'));
      }

      templates.all.addCoinLogin = templates.all.addCoinLogin.replace('{{ modal_title }}', isIguana ? helper.lang('LOGIN.ADD_COIN') : helper.lang('LOGIN.ADD_WALLET')).
                                                      replace('{{ cta_title }}', isIguana ? helper.lang('ADD_COIN.SELECT_A_COIN_TO_ADD') : helper.lang('DASHBOARD.SELECT_A_WALLET_TO_ADD')).
                                                      replace('{{ word_count }}', isIguana ? 24 : 12).
                                                      replace('{{ item }}', isIguana ? ' ' + helper.lang('ADD_COIN.A_COIN') : ' ' + helper.lang('ADD_COIN.A_COIN')).
                                                      replace(/{{ visibility }}/g, isIguana ? ' hidden' : '');
      templates.all.addCoinCreateWallet = templates.all.addCoinCreateWallet.replace('{{ word_count }}', isIguana ? 24 : 12); // TODO: global

      $('body').append(templates.all.addCoin).
                append(templates.all.sendCoinPassphrase).
                append(templates.all.receiveCoin).
                append(templates.all.addCoinLogin).
                append(templates.all.addCoinCreateWallet);

      // message modal
      helper.initMessageModal();
      helper.prepMessageModal(helper.lang('MESSAGE.ADDRESS_IS_COPIED'), 'blue');

      if (!isIguana) $('.btn-add-coin').html(helper.lang('PASSPHRASE_MODAL.ADD_A_WALLET'));
      if (activeCoin) defaultCoin = activeCoin.toUpperCase();

      $('.dashboard').removeClass('hidden');

      updateRates(null, null, null, true);
      constructAccountCoinRepeater(true);
      updateDashboardView(dashboardUpdateTimout);

      var topMenuItem = $('.top-menu .item')
          activeClassName = 'active';
      topMenuItem.click(function() {
        topMenuItem.each(function(index, item) {
          $(this).removeClass(activeClassName);
        });

        $(this).addClass(activeClassName);
        helper.openPage($(this).attr('data-url'));
      });

      $('.lnk-logout').click(function() {
        helper.logout();
      });

      //if (!isIguana && !dev.isDev) $('.lnk-logout').hide();
      var addCoinLoginClass = '.add-coin-login-form',
          addNewCoinFormClass = '.add-new-coin-form',
          loginFormClass = '.login-form-modal',
          addCoinCreateClass = '.add-coin-create-wallet-form',
          passphraseElName = '#passphrase',
          disabledClassName = 'disabled',
          hiddenClassName = 'hidden';

      $('.btn-add-coin').click(function() {
        if (isIguana) {
          addCoinButtonCB();
          var addNewCoinForm = $('.add-new-coin-form .btn-next');
          addNewCoinForm.off();
          addNewCoinForm.click(function() {
            coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

            for (var i=0; i < coinsSelectedToAdd.length; i++) {
              if (coinsSelectedToAdd[i]) {
                (function(x) {
                  setTimeout(function() {
                    api.addCoin(coinsSelectedToAdd[x], addCoinDashboardCB);
                  }, x === 0 ? 0 : settings.addCoinTimeout * 1000);
                })(i);
              }
            }
          });
        } else {
          //addCoinButtonCB();
          initAuthCB();
          coinsSelectedToAdd = [];
          $(addCoinLoginClass + ' .login-add-coin-selection-title').html(helper.lang('DASHBOARD.SELECT_A_WALLET_TO_ADD'));
          $(addCoinLoginClass + ' ' + passphraseElName).val('');
          $(addCoinLoginClass + ' .btn-signin').addClass(disabledClassName);
          $(addCoinLoginClass + ' ' + passphraseElName).keyup(function() {
            if ($(addCoinLoginClass + ' ' + passphraseElName).val().length > 0 && helper.reindexAssocArray(coinsSelectedToAdd)[0]) {
              $(addCoinLoginClass + ' .btn-signin').removeClass(disabledClassName);
            } else {
              $(addCoinLoginClass + ' .btn-signin').addClass(disabledClassName);
            }
          });
          helper.toggleModalWindow(addCoinLoginClass.replace('.', ''), 300);
        }
      });

      $(addCoinLoginClass + '.btn-signup').click(function() {
        var addCoinCreateVerifyClass = addCoinCreateClass + ' .verify-passphrase-form';

        if (!coinsSelectedToAdd || !coinsSelectedToAdd[0]) {
          helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
        } else {
          $(addCoinCreateVerifyClass + ' #passphrase').val('');
          $(addCoinCreateVerifyClass).addClass(hiddenClassName);
          $(addCoinCreateClass + ' .create-account-form').removeClass(hiddenClassName);

          helper.toggleModalWindow(addCoinCreateClass.replace('.', ''), 300);

          coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

          if (coinsSelectedToAdd[0]) {
            $(addCoinCreateClass + ' .login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + templates.all.repeaters.coinSelectionShowItem.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
          }
          initAuthCB();
          $(addCoinCreateClass + ' .login-add-coin-selection-title').click(function() {
            addCoinButtonCB();
          });
          $(addCoinCreateClass + ' .btn-close,' + addCoinCreateClass + ' .modal-overlay').click(function() {
            helper.toggleModalWindow(addCoinCreateClass.replace('.', ''), 300);
          });
          $(addCoinCreateVerifyClass + ' .btn-back').off();
          $(addCoinCreateVerifyClass + ' .btn-back').click(function() {
            $(addCoinCreateVerifyClass).addClass(disabledClassName);
            $(addCoinCreateClass + ' .create-account-form').removeClass(disabledClassName);
          });
          $(addCoinCreateVerifyClass + ' .btn-add-account').off();
          $(addCoinCreateVerifyClass + ' .btn-add-account').click(function() {
            encryptCoindWallet('add-coin-create-wallet-form .verify-passphrase-form');
          });
        }
      });
      $(addCoinLoginClass + ' .login-add-coin-selection-title').click(function() {
        addCoinButtonCB();

        $(addNewCoinFormClass + ' .btn-next').off();
        $(addNewCoinFormClass + ' .btn-next').click(function() {
          coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

          if (coinsSelectedToAdd[0]) {
            $(addNewCoinFormClass + ' .login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + templates.all.repeaters.coinSelectionShowItem.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
          }
          // coind
          coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
          helper.toggleModalWindow(addNewCoinFormClass.replace('.', ''), 300);

          var verifyPassphraseFormClass = '.verify-passphrase-form';

          if (dev.isDev && dev.coinPW.coind[coinsSelectedToAdd[0]]) {
            $(addCoinLoginClass + ' ' + passphraseElName).val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
            $(addCoinLoginClass + ' .btn-signin').removeClass(disabledClassName);
          } else {
            $(addCoinLoginClass + ' ' + passphraseElName).val('');
            $(addCoinLoginClass + ' .btn-signin').addClass(disabledClassName);
          }
          $(verifyPassphraseFormClass + ' ' + passphraseElName).keyup(function() {
            if ($(verifyPassphraseFormClass + ' ' + passphraseElName).val().length > 0) {
              $('.btn-add-account').removeClass(disabledClassName);
            } else {
              $('.btn-btn-add-account').addClass(disabledClassName);
            }
          });
          $(addCoinLoginClass + ' .btn-signin').off();
          $(addCoinLoginClass + ' .btn-signin').click(function() {
            authAllAvailableCoind(addCoinLoginClass.replace('.', ''));
          });
        });
      });
      $('.btn-receive').click(function(){
         bindReceive();
      });
      $('.transactions-unit .btn-send').click(function() {
        sendCoinModalInit();
      });

      // modals
      // add coin
      $(addCoinLoginClass + ' .btn-close,' + addCoinLoginClass + ' .modal-overlay').click(function() {
        helper.toggleModalWindow(addCoinLoginClass.replace('.', ''), 300);
        coinsSelectedToAdd = [];
        $('body').removeClass('modal-open');
      });
      // add coin selector modal
      $(addNewCoinFormClass + ' .btn-close,' + addNewCoinFormClass + ' .modal-overlay').click(function() {
        helper.toggleModalWindow(addNewCoinFormClass.replace('.', ''), 300);
        coinsSelectedToAdd = [];
        $('.supported-coins-repeater-inner').html(constructCoinRepeater());
        bindClickInCoinRepeater();
      });
      // add coin passphrase
      $(loginFormClass + ' .btn-close,' + loginFormClass + ' .modal-overlay').click(function() {
        helper.toggleModalWindow(loginFormClass.replace('.', ''), 300);
      });

      bindCoinRepeaterSearch();
      applyDashboardResizeFix();

      $(window).resize(function() {
        applyDashboardResizeFix();
      });
    }


    /*

    var defaultCurrency = '',
        defaultCoin = '',
        coinToCurrencyRate = 0,
        coinsSelectedByUser = [],
        defaultAccount,
        ratesUpdateTimeout = settings.ratesUpdateTimeout,
        decimalPlacesCoin = settings.decimalPlacesCoin,
        decimalPlacesCurrency = settings.decimalPlacesCurrency,
        decimalPlacesTxUnit = settings.decimalPlacesTxUnit,
        dashboardUpdateTimout = settings.dashboardUpdateTimout,
        dashboardUpdateTimer;

    // on les then 768px working this function
    function bindMobileView() {
      var coins = $('aside.coins'),
          item = $('.item.active', coins),
          transactionsUnit = $('.transactions-unit');

      mobileView(coins, item, transactionsUnit);
      $(window).resize(function () {
        mobileView(coins, item, transactionsUnit);
      })
    }
    function mobileView(coins, item, transactionsUnit) {
      item = $('.item.active', coins);
      if ($(window).width() > 767) {
        //coins.css({ 'min-width': '230px', 'max-width': '270px' });
        item.removeClass('hidden-after');
        transactionsUnit.removeAttr('style');
      } else {
        coins.removeAttr('style');
        item.addClass('hidden-after');
        transactionsUnit.css('margin-left', '0');
      }
    }



    // send to address
    var sendFormDataCopy = {};

    function sendCoinModalInit(isBackTriggered) {
      var templateToLoad = templates.all.sendCoinEntry,
          activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
          coinData = getCoinData(activeCoin),
          activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
          activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html()),
          currentCoinRate = updateRates(coinData.id, defaultCurrency, true);

      // prep template
      templateToLoad = templateToLoad.
                       replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                       replace('{{ coin_name }}', coinData.name).
                       replace(/{{ currency }}/g, defaultCurrency).
                       replace('{{ coin_value }}', activeCoinBalanceCoin).
                       replace('{{ currency_value }}', activeCoinBalanceCurrency).
                       replace('{{ address }}', isBackTriggered ? sendFormDataCopy.address || '' : '').
                       replace('{{ amount }}', isBackTriggered ? sendFormDataCopy.amount || 0 : '').
                       replace('{{ fee }}', isBackTriggered ? sendFormDataCopy.fee || 0 : coinsInfo[coinData.id].relayFee || 0.00001).
                       replace('{{ fee_currency }}', isBackTriggered ? sendFormDataCopy.feeCurrency || 0 : (coinsInfo[coinData.id].relayFee || 0.00001 * currentCoinRate).toFixed(8)).
                       replace('{{ note }}', isBackTriggered ? sendFormDataCopy.note || '' : '');

      var modalSendCoinClass = '.modal-send-coin';
      $(modalSendCoinClass).html(templateToLoad);

      if (!currentCoinRate) {
        $(modalSendCoinClass + ' .tx-amount-currency').val(0);
        $(modalSendCoinClass + ' .tx-fee-currency').val(0);
        $(modalSendCoinClass + ' .tx-amount-currency').attr('disabled', true);
        $(modalSendCoinClass + ' .tx-fee-currency').attr('disabled', true);
      }

      // ref: http://jsfiddle.net/dinopasic/a3dw74sz/
      // allow numeric only entry
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
          currentCoinRate = updateRates(coinData.id, defaultCurrency, true);

          var modalSendCoinField = modalSendCoinClass + ' .' + fieldName;
          if (type) {
            var fielValue = $(modalSendCoinField).val() * currentCoinRate;
            $(modalSendCoinField + '-currency').val(fielValue.toFixed(helper.decimalPlacesFormat(fielValue).coin));
          } else {
            var fieldValue = $(modalSendCoinField + '-currency').val() / currentCoinRate;
            $(modalSendCoinField).val(fieldValue.toFixed(helper.decimalPlacesFormat(fieldValue).coin));
          }
        } else {
          evt.preventDefault();
        }
      }

      // dev
       if (dev.isDev) loadTestSendData(coinData.id);

      var sendCoinParentClass = '.send-coin-form';
      if (!isBackTriggered) helper.toggleModalWindow(sendCoinParentClass.replace('.', ''), 300);
      // btn close
      $(sendCoinParentClass + ' .btn-close,' + sendCoinParentClass + ' .modal-overlay').click(function() {
        helper.toggleModalWindow(sendCoinParentClass.replace('.', ''), 300);
      });
      // btn next
      $(modalSendCoinClass + ' .btn-next').click(function() {
        // copy send coin data entered by a user
        sendFormDataCopy = { address: $(modalSendCoinClass + ' .tx-address').val(),
                             amount: $(modalSendCoinClass + ' .tx-amount').val(),
                             amountCurrency: $(modalSendCoinClass + ' .tx-amount-currency').val(),
                             fee: $(modalSendCoinClass + ' .tx-fee').val(),
                             feeCurrency: $(modalSendCoinClass + ' .tx-fee-currency').val(),
                             note: $(modalSendCoinClass + ' .tx-note').val() };

        sendCoinModalConfirm();
      });
    }

    function sendCoinModalConfirm() {
      if (validateSendCoinForm()) {
        var templateToLoad = templates.all.sendCoinConfirmation,
            sendCoinFormClass = '.send-coin-form';
            accountCoinsRepeaterActive = '.account-coins-repeater .item.active';
            activeCoin = $(accountCoinsRepeaterActive).attr('data-coin-id'),
            coinData = getCoinData(activeCoin),
            activeCoinBalanceCoin = Number($(accountCoinsRepeaterActive + ' .balance .coin-value .val').html()),
            activeCoinBalanceCurrency = Number($(accountCoinsRepeaterActive + ' .balance .currency-value .val').html()),
            txAddress = $(sendCoinFormClass + ' .tx-address').val(),
            txAmount = $(sendCoinFormClass + ' .tx-amount').val(),
            txAmountCurrency = $(sendCoinFormClass + ' .tx-amount-currency').val(),
            txFee = $(sendCoinFormClass + ' .tx-fee').val(),
            txFeeCurrency = $(sendCoinFormClass + ' .tx-fee-currency').val(),
            txNote = $(sendCoinFormClass + ' .tx-note').val();

        // prep template
        templateToLoad = templateToLoad.
                         replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                         replace('{{ coin_name }}', coinData.name).
                         replace(/{{ currency }}/g, defaultCurrency).
                         replace('{{ coin_value }}', activeCoinBalanceCoin).
                         replace('{{ currency_value }}', activeCoinBalanceCurrency).
                         replace('{{ tx_coin_address }}', txAddress).
                         replace('{{ tx_coin_amount }}', txAmount).
                         replace('{{ tx_coin_amount_currency }}', txAmountCurrency).
                         replace(/{{ tx_coin_fee_value }}/g, txFee).
                         replace('{{ tx_coin_fee_currency }}', txFeeCurrency).
                         replace('{{ tx_note }}', txNote).
                         replace('{{ tx_total }}', txAmount);

        $('.modal-send-coin').html(templateToLoad);

        // btn back
        $(sendCoinFormClass + ' .btn-back').click(function() {
          sendCoinModalInit(true);
        });

        $('.btn-confirm-tx').click(function() {
          var txDataToSend = { address: txAddress,
                               amount: txAmount,
                               note: txNote };

          if (!isIguana) {
            var sendConfirmPassphraseClass = '.send-coin-confirm-passphrase'
                passphraseElement = '#passphrase',
                disabledClassName = 'disabled';
            // TODO: ugly, rewrite
            $('.modal-append-container').html(templates.all.sendCoinPassphrase.
                                              replace('login-form-modal', 'send-coin-confirm-passphrase').
                                              replace('>Add<', '>Ok<').
                                              replace('Add a wallet', 'Wallet passphrase').
                                              replace('to add wallet', 'to confirm transaction'));

            helper.toggleModalWindow('send-coin-confirm-passphrase', 300);

            if (dev.isDev && dev.coinPW.coind[coinData.id]) {
              $(sendConfirmPassphraseClass + ' ' + passphraseElement).val(dev.coinPW.coind[coinData.id]);
              $(sendConfirmPassphraseClass + ' .btn-add-wallet').removeClass(disabledClassName);
            } else {
              $('.login-form-modal ' + passphraseElement).val('');
              $(sendConfirmPassphraseClass + ' .btn-add-wallet').addClass(disabledClassName);
            }

            $(sendConfirmPassphraseClass + ' .btn-close,' + sendConfirmPassphraseClass + ' .modal-overlay').click(function() {
              helper.toggleModalWindow(sendConfirmPassphraseClass.replace('.', ''), 300);
            });

            $(sendConfirmPassphraseClass + ' .btn-add-wallet').click(function() {
              var coindWalletLogin = api.walletLogin($(sendConfirmPassphraseClass + ' ' + passphraseElement).val(), settings.defaultWalletUnlockPeriod, coinData.id);

              if (coindWalletLogin !== -14) {
                helper.toggleModalWindow(sendConfirmPassphraseClass.replace('.', ''), 300);
                execSendCoinCall();
              } else {
                helper.prepMessageModal(helper.lang('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
              }
            });
          } else {
            execSendCoinCall();
          }

          function execSendCoinCall() {
            var setTxFeeResult = false;

            if (Number(sendFormDataCopy.fee) !== Number(coinsInfo[coinData.id].relayFee) && Number(sendFormDataCopy.fee) !== 0.00001 && Number(sendFormDataCopy.fee) !== 0) {
              setTxFeeResult = api.setTxFee(coinData.id, sendFormDataCopy.fee);
            }

            var sendTxResult = api.sendToAddress(coinData.id, txDataToSend);

            if (sendTxResult.length === 64) {
              // go to success step
              $(sendCoinFormClass + ' .rs_modal').addClass('blur');
              $(sendCoinFormClass + ' .send-coin-success-overlay').removeClass('hidden');

              $(sendCoinFormClass + ' .btn-confirmed').click(function() {
                helper.toggleModalWindow(sendCoinFormClass.replace('.', ''), 300);
              });
            } else {
              // go to an error step
              helper.prepMessageModal(helper.lang('MESSAGE.TRANSACTION_ERROR'), 'red', true);
            }

            // revert pay fee
            if (setTxFeeResult) api.setTxFee(coinData.id, 0);
          }
        });
      }
    }

    // TODO: 1) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
    //      1a) address byte prefix check
    function validateSendCoinForm() {
      var isValid = false,
          activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
          coinData = getCoinData(activeCoin),
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
        txAddressValidation.html(helper.lang('SEND.INCORRECT_ADDRESS')).
                            addClass(errorClassName2);
      } else {
        txAddressObj.removeClass(errorClassName);
        txAddressValidation.html(helper.lang('SEND.ENTER_A_WALLET_ADDRESS')).
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
        txAmountValidation.html(Number(txAmountVal) === 0 || !txAmountVal.length ? helper.lang('SEND.PLEASE_ENTER_AN_AMOUNT') : helper.lang('SEND.NOT_ENOUGH_MONEY') + ' ' + activeCoinBalanceCoin + ' ' + coinName).
                           addClass(errorClassName2);
      } else {
        txAmountObj.removeClass(errorClassName);
        txAmountCurrencyObj.removeClass(errorClassName);
        txAmountValidation.html(helper.lang('RECEIVE.ENTER_IN') + ' ' + coinName + ' ' + helper.lang('LOGIN.OR') + ' ' + defaultCurrency.toUpperCase()).
                           removeClass(errorClassName2);
      }
      // fee
      var txFeeObj = $('.tx-fee'),
          txFeeCurrencyObj = $('.tx-fee-currency'),
          txFeeValidation = $('.tx-fee-validation');
      if ((Number(txFeeVal) + Number(txAmountVal)) > activeCoinBalanceCoin) {
        txFeeObj.addClass(errorClassName);
        txFeeCurrencyObj.addClass(errorClassName);
        txFeeValidation.html((activeCoinBalanceCoin - Number(txAmountVal)) > 0 ? helper.lang('SEND.FEE_CANNOT_EXCEED') + ' ' + (activeCoinBalanceCoin - Number(txAmountVal)) : helper.lang('SEND.TOTAL_AMOUNT_CANNOT_EXCEED') + ' ' + activeCoinBalanceCoin).
                        addClass(errorClassName2);
      }
      if (Number(txFeeVal) < (coinsInfo[coinData.id].relayFee || 0.00001)) { // TODO: settings
        txFeeObj.addClass(errorClassName);
        txFeeCurrencyObj.addClass(errorClassName);
        txFeeValidation.html((coinsInfo[coinData.id].relayFee || 0.00001) + ' ' + helper.lang('SEND.IS_A_MIN_REQUIRED_FEE')).
                        addClass(errorClassName2);
      }
      if ((Number(txFeeVal) >= (coinsInfo[coinData.id].relayFee || 0.00001)) && (Number(txFeeVal) + Number(txAmountVal)) < activeCoinBalanceCoin)  {
        txFeeObj.removeClass(errorClassName);
        txFeeCurrencyObj.removeClass(errorClassName);
        txFeeValidation.html(helper.lang('SEND.MINIMUM_FEE')).
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

    // on les then 768px working this function//
    initTopNavBar = function () {
      var topMenu = $('#top-menu');
      var btnLeft = $('.nav-buttons .nav-left', topMenu),
        btnRight = $('.nav-buttons .nav-right', topMenu),
        items = $('.item', topMenu), itemsLength = 0, item;

      btnLeft.on('click swipeleft', function () {
        if ($(window).width() < $('.top-menu', topMenu).width()) {
          itemsLength = $('.top-menu', topMenu).width();
          for (var i = items.length - 1; 0 <= i; i--) {
            item = $(items[i]);
            itemsLength -= $(items[i]).width();
            if ($(items[i]).offset().left + $(items[i]).width() < $('.top-menu', topMenu).width() &&
              itemsLength > $(items[i]).width()) {
              item.closest('.navbar-nav').animate({'margin-left':
              parseFloat(item.closest('.navbar-nav').css('margin-left')) + $(items[i]).width()}, "slow");
              itemsLength = 0;
              break;
            } else return;
          }
        }
      });
      btnRight.on('click swiperight', function () {
        if ($(window).width() < $('.top-menu', topMenu).width())
          for (var i = 0; items.length > i; i++) {
            item = $(items[i]);
            itemsLength += $(items[i]).offset().left;
            if ($(items[i]).offset().left < topMenu.width() &&
              itemsLength > topMenu.width()) {
              item.closest('.navbar-nav').animate({'margin-left':
                (parseFloat(item.closest('.navbar-nav').css('margin-left')) - $(items[i]).width())}, "slow");
              itemsLength = 0;
              break;
            }
          }
      });

    };
    $(document).ready(function () {
      initTopNavBar();
    });*/
}]);