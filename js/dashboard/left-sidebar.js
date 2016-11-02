/*!
 * Iguana dashboard/left-sidebar
 *
 */

templates.all.repeaters.accountCoinItem = templates.all.repeaters.accountCoinItem.replace('{{ injectLoader }}', templates.all.loader); // add loader spinner to each coin element

var coinBalances = [];

function constructAccountCoinRepeater(isFirstRun) {
  // TODO: investigate why coinsInfo[key].connection === true is failing on port poll
  var index = 0;
  for (var key in coinsInfo) {
    if ((isIguana && localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
      coinsSelectedByUser[index] = key;
      index++;
    }
  }

  if (coinsSelectedByUser.length === 0) helper.logout();

  coinBalances = [];

  for (var i=0; i < coinsSelectedByUser.length; i++) {
    if (isFirstRun) constructAccountCoinRepeaterCB(0, coinsSelectedByUser[i]);
    api.getBalance(defaultAccount, coinsSelectedByUser[i], constructAccountCoinRepeaterCB);
  }
}

// construct account coins array
function constructAccountCoinRepeaterCB(balance, coin) {
  var result = '',
      accountCoinRepeaterHTML = '',
      isActiveCoinSet = accountCoinRepeaterHTML.indexOf('item active') > -1 ? true : false,
      acountCoinsRepeaterCoin = '.account-coins-repeater .' + coin,
      loadingClassName = 'loading',
      disabledClassName = 'disabled';

  api.checkBackEndConnectionStatus();
  coinBalances[coin] = balance;

  if ($(acountCoinsRepeaterCoin).html()) { // only update values
    var coinBalance = coinBalances[coin] || 0;
    coinLocalRate = updateRates(coin.toUpperCase(), defaultCurrency, true) || 0;

    var currencyCalculatedValue = coinBalance * coinLocalRate,
        coinData = getCoinData(coin),
        coinBalanceVal = coinBalance ? coinBalance.toFixed(helper.decimalPlacesFormat(coinBalance).coin) : 0,
        coinBalanceCurrencyVal = currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency);

    $(acountCoinsRepeaterCoin + ' .coin-value .val').html(coinBalanceVal);
    $(acountCoinsRepeaterCoin + ' .currency-value .val').html(coinBalanceCurrencyVal);

    // enable loader spinner if coin is out of sync/not connected
    if (coinsInfo[coin].connection === true && coinsInfo[coin].RT === true) {
      $(acountCoinsRepeaterCoin).removeClass(loadingClassName);
      $(acountCoinsRepeaterCoin).removeClass(disabledClassName);
    } else {
      $(acountCoinsRepeaterCoin).addClass(loadingClassName);
      $(acountCoinsRepeaterCoin).addClass(disabledClassName);
    }
  } else { // actual DOM append
    var coinLocalRate = 0,
        coinBalance = coinBalances[coin] || 0;

    coinLocalRate = updateRates(coin.toUpperCase(), defaultCurrency, true) || 0;

    var currencyCalculatedValue = coinBalance * coinLocalRate,
        coinData = getCoinData(coin);

    if (!isActiveCoinSet && !activeCoin) activeCoin = coinData.id;
    if (coinData)
      result = templates.all.repeaters.accountCoinItem.
                replace('{{ dev }}', dev.isDev && !isIguana ? '' : ' hidden').
                replace('{{ id }}', coinData.id.toUpperCase()).
                replace('{{ name }}', coinData.name).
                replace(/{{ coin_id }}/g, coinData.id.toLowerCase()).
                replace('{{ coin_id_uc }}', coinData.id.toUpperCase()).
                replace('{{ currency_name }}', defaultCurrency).
                replace('{{ coin_balance_unformatted }}', coinBalance).
                replace('{{ coin_value }}', coinBalance ? coinBalance.toFixed(helper.decimalPlacesFormat(coinBalance).coin) : 0).
                replace('{{ currency_value }}', currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency)).
                replace('{{ active }}', activeCoin === coinData.id ? ' active' : '');

    var accountCoinsRepeater = $('.account-coins-repeater');
    if (accountCoinsRepeater.html().indexOf(helper.lang('DASHBOARD.LOADING')) > -1) accountCoinsRepeater.html('');
    accountCoinsRepeater.append(result);
    $('.account-coins-repeater .' + coin).addClass(disabledClassName);
    bindClickInAccountCoinRepeater();
  }

  // sort coins
  var index = 0,
      sortedAccountCoinsRepeater = '';
  for (var key in coinsInfo) {
    if ((isIguana && localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
      index++;
      var accountCoinsRepeaterCoin = '.account-coins-repeater .' + key;
      if ($(accountCoinsRepeaterCoin).html() && $(accountCoinsRepeaterCoin)[0].outerHTML)
        sortedAccountCoinsRepeater = sortedAccountCoinsRepeater + $(accountCoinsRepeaterCoin)[0].outerHTML;
    }
  }

  $('.account-coins-repeater').html(sortedAccountCoinsRepeater);
  bindClickInAccountCoinRepeater();
  applyDashboardResizeFix();

  if (dev.isDev && !isIguana) {
    var accountCoinsRepeaterItem = '.account-coins-repeater .item',
        hiddenClassName = 'hidden';
    if ($(accountCoinsRepeaterItem).length === 1) $(accountCoinsRepeaterItem + ' .remove-coin').addClass(hiddenClassName);
    else $(accountCoinsRepeaterItem + ' .remove-coin').removeClass(hiddenClassName);
  }

  // run balances and tx unit update once left sidebar is updated
  if (index === Object.keys(coinBalances).length) {
    checkAddCoinButton();
    // disable send button if ther're no funds on a wallet
    var buttonSend = $('.transactions-unit .action-buttons .btn-send');
    if (Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()) <= 0) {
      buttonSend.addClass('disabled');
    } else {
      buttonSend.removeClass('disabled');
    }
    updateTotalBalance();
    updateTransactionUnitBalance(true);
    if ($('.transactions-list-repeater').html().indexOf(helper.lang('DASHBOARD.LOADING')) > -1) constructTransactionUnitRepeater();
  }
}

function bindClickInAccountCoinRepeater() {
  var accountCoinsRepeaterItem = '.account-coins-repeater .item',
      removeCoinClass = '.remove-coin',
      hiddenClassName = 'hidden',
      activeClassName = 'active';

  $(accountCoinsRepeaterItem).each(function(index, item) {
    $(this).find(removeCoinClass).click(function() {
      var parentCoinId = $(this).parent().attr('data-coin-id');

      if (confirm(helper.lang('DASHBOARD.ARE_YOU_SURE_YOU_WANT') + ' ' + parentCoinId.toUpperCase()) === true) {
        if ($(accountCoinsRepeaterItem + '.active').attr('data-coin-id').toString() === parentCoinId.toString())
          $(accountCoinsRepeaterItem + ':first-child .clickable-area').click();
        $(this).parent().remove();
        localstorage.setVal('iguana-' + $(this).parent().attr('data-coin-id') + '-passphrase', { 'logged': 'no' });
        checkAddCoinButton();

        if ($(accountCoinsRepeaterItem).length === 1) $(accountCoinsRepeaterItem + ' ' + removeCoinClass).addClass(hiddenClassName);
        else $(accountCoinsRepeaterItem + ' ' + removeCoinClass).removeClass(hiddenClassName);
      }
    });
    $(this).find('.clickable-area').click(function() {
      if (!$(this).parent().hasClass('disabled')) {
        $('.account-coins-repeater .item').filter(':visible').removeClass(activeClassName);

        if ($(this).parent().hasClass(activeClassName)) {
          $(this).parent().removeClass(activeClassName);
        } else {
          var oldActiveCoinVal = activeCoin;

          $(this).parent().addClass(activeClassName);
          activeCoin = $(this).parent().attr('data-coin-id'); // TODO: global
          localstorage.setVal('iguana-active-coin', { id: activeCoin });

          if (oldActiveCoinVal !== activeCoin) {
            updateTransactionUnitBalance();
            constructTransactionUnitRepeater();
          }
        }
      }
    });
  });
}

function checkAddCoinButton() {
  // disable add wallet/coin button if all coins/wallets are already in the sidebar
  var coinsLeftToAdd = 0;
  for (var key in supportedCoinsList) {
    if (!localstorage.getVal('iguana-' + key + '-passphrase') || (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes')) {
      if ((isIguana && coinsInfo[key].iguana !== false) || (!isIguana && coinsInfo[key].connection === true)) {
        coinsLeftToAdd++;
      }
    }
  }
  var buttAddCoin = $('.coins .btn-add-coin');
  if (!coinsLeftToAdd) buttAddCoin.addClass('disabled');
  else buttAddCoin.removeClass('disabled');
}
