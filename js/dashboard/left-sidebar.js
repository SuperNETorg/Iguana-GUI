/*!
 * Iguana dashboard/left-sidebar
 *
 */

var accountCoinRepeaterTemplate = '<div class=\"item loading {{ coin_id }}{{ active }}\" data-coin-id=\"{{ coin_id }}\" data-coin-balance-value=\"{{ coin_balance_unformatted }}\">' +
                                    '{{ injectLoader }}' +
                                    '<div class=\"remove-coin cursor-pointer{{ dev }}\"></div>' +
                                    '<div class=\"clickable-area\">' +
                                      '<div class=\"coin\">' +
                                        '<i class=\"icon cc {{ id }}-alt\"></i>' +
                                        '<div class=\"name\">{{ name }}</div>' +
                                      '</div>' +
                                      '<div class=\"balance\">' +
                                        '<div class=\"coin-value\"><span class=\"val\">{{ coin_value }}</span> {{ coin_id_uc }}</div>' +
                                        '<div class=\"currency-value\"><span class=\"val\">{{ currency_value }}</span> {{ currency_name }}</div>' +
                                      '</div>' +
                                    '</div>' +
                                  '</div>';
accountCoinRepeaterTemplate = accountCoinRepeaterTemplate.replace('{{ injectLoader }}', loaderIconTemplate); // add loader spinner to each coin element

var coinBalances = [];

function constructAccountCoinRepeater(isFirstRun) {
  // TODO: investigate why coinsInfo[key].connection === true is failing on port poll
  var index = 0;
  for (var key in coinsInfo) {
    if ((isIguana && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
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
      isActiveCoinSet = accountCoinRepeaterHTML.indexOf('item active') > -1 ? true : false;

  api.checkBackEndConnectionStatus();
  coinBalances[coin] = balance;

  if ($('.account-coins-repeater .' + coin).html()) { // only update values
    var coinBalance = coinBalances[coin] || 0;
    coinLocalRate = updateRates(coin.toUpperCase(), defaultCurrency, true) || 0;

    var currencyCalculatedValue = coinBalance * coinLocalRate,
        coinData = getCoinData(coin);

    $('.account-coins-repeater .' + coin + ' .coin-value .val').html(coinBalance ? coinBalance.toFixed(helper.decimalPlacesFormat(coinBalance).coin) : 0);
    $('.account-coins-repeater .' + coin + ' .currency-value .val').html(currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency));
    if (coinsInfo[coin] && coinsInfo[coin].connection === false) $('.account-coins-repeater .' + coin).addClass('disabled');
    else $('.account-coins-repeater .' + coin).removeClass('disabled');

    // enable loader spinner if coin is out of sync/not connected
    if (coinsInfo[coin].connection === true && coinsInfo[coin].RT === true) {
      $('.account-coins-repeater .' + coin).removeClass('loading');
    } else {
      $('.account-coins-repeater .' + coin).addClass('loading');
    }
  } else { // actual DOM append
    var coinLocalRate = 0,
        coinBalance = coinBalances[coin] || 0;

    coinLocalRate = updateRates(coin.toUpperCase(), defaultCurrency, true) || 0;

    var currencyCalculatedValue = coinBalance * coinLocalRate,
        coinData = getCoinData(coin);

    if (!isActiveCoinSet && !activeCoin) activeCoin = coinData.id;
    if (coinData)
      result = accountCoinRepeaterTemplate.
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

    if ($('.account-coins-repeater').html().indexOf('Loading') > -1) $('.account-coins-repeater').html('');
    $('.account-coins-repeater').append(result);
    bindClickInAccountCoinRepeater();
  }

  // sort coins
  var index = 0,
      sortedAccountCoinsRepeater = '';
  for (var key in coinsInfo) {
    if ((isIguana && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
      index++;
      if ($('.account-coins-repeater .' + key).html() && $('.account-coins-repeater .' + key)[0].outerHTML) sortedAccountCoinsRepeater = sortedAccountCoinsRepeater + $('.account-coins-repeater .' + key)[0].outerHTML;
    }
  }

  $('.account-coins-repeater').html(sortedAccountCoinsRepeater);
  bindClickInAccountCoinRepeater();
  applyDashboardResizeFix();

  if (dev.isDev && !isIguana) {
    if ($('.account-coins-repeater .item').length === 1) $('.account-coins-repeater .item .remove-coin').addClass('hidden');
    else $('.account-coins-repeater .item .remove-coin').removeClass('hidden');
  }

  // run balances and tx unit update once left sidebar is updated
  if (index === Object.keys(coinBalances).length) {
    checkAddCoinButton();
    // disable send button if ther're no funds on a wallet
    if (Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()) <= 0) {
      $('.transactions-unit .action-buttons .btn-send').addClass('disabled');
    } else {
      $('.transactions-unit .action-buttons .btn-send').removeClass('disabled');
    }
    updateTotalBalance();
    updateTransactionUnitBalance();
    if ($('.transactions-list-repeater').html().indexOf('Loading') > -1) constructTransactionUnitRepeater();
  }
}

function bindClickInAccountCoinRepeater() {
  $('.account-coins-repeater .item').each(function(index, item) {
    $(this).find('.remove-coin').click(function() {
      if (confirm('Are you sure you want to remove ' + $(this).parent().attr('data-coin-id').toUpperCase()) === true) {
        if ($('.account-coins-repeater .item.active').attr('data-coin-id').toString() === $(this).parent().attr('data-coin-id').toString())
          $('.account-coins-repeater .item:first-child .clickable-area').click();
        $(this).parent().remove();
        localstorage.setVal('iguana-' + $(this).parent().attr('data-coin-id') + '-passphrase', { 'logged': 'no' });
        checkAddCoinButton();

        if ($('.account-coins-repeater .item').length === 1) $('.account-coins-repeater .item .remove-coin').addClass('hidden');
        else $('.account-coins-repeater .item .remove-coin').removeClass('hidden');
      }
    });
    $(this).find('.clickable-area').click(function() {
      if (!$(this).parent().hasClass('disabled')) {
        $('.account-coins-repeater .item').filter(':visible').removeClass('active');

        if ($(this).parent().hasClass('active')) {
          $(this).parent().removeClass('active');
        } else {
          var oldActiveCoinVal = activeCoin;

          $(this).parent().addClass('active');
          activeCoin = $(this).parent().attr('data-coin-id');
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
    if (localstorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes') {
      if ((isIguana && coinsInfo[key].iguana !== false) || (!isIguana && coinsInfo[key].connection === true)) {
        coinsLeftToAdd++;
      }
    }
  }
  if (!coinsLeftToAdd) $('.coins .btn-add-coin').addClass('disabled');
  else $('.coins .btn-add-coin').removeClass('disabled');
}

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