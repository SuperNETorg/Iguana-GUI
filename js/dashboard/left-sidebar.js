/*!
 * Iguana dashboard/left-sidebar
 *
 */

var accountCoinRepeaterTemplate = '<div class=\"item {{ coin_id }}{{ active }}\" data-coin-id=\"{{ coin_id }}\" data-coin-balance-value=\"{{ coin_balance_unformatted }}\">' +
                                    '<div class=\"coin\">' +
                                      '<i class=\"icon cc {{ id }}-alt\"></i>' +
                                      '<div class=\"name\">{{ name }}</div>' +
                                    '</div>' +
                                    '<div class=\"balance\">' +
                                      '<div class=\"coin-value\"><span class=\"val\">{{ coin_value }}</span> {{ coin_id_uc }}</div>' +
                                      '<div class=\"currency-value\"><span class=\"val\">{{ currency_value }}</span> {{ currency_name }}</div>' +
                                    '</div>' +
                                  '</div>';

var coinBalances = [];

function constructAccountCoinRepeater() {
  var api = new apiProto(),
  localStorage = new localStorageProto();

  // TODO: investigate why coinsInfo[key].connection === true is failing on port poll
  var index = 0;
  for (var key in coinsInfo) {
    if ((isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
      coinsSelectedByUser[index] = key;
      index++;
    }
  }

  if (coinsSelectedByUser.length === 0) helperProto.prototype.logout();

  coinBalances = [];

  for (var i=0; i < coinsSelectedByUser.length; i++) {
    api.getBalance(defaultAccount, coinsSelectedByUser[i], constructAccountCoinRepeaterCB);
  }
}

// construct account coins array
function constructAccountCoinRepeaterCB(balance, coin) {
  var result = '',
      localStorage = new localStorageProto(),
      helper = new helperProto(),
      accountCoinRepeaterHTML = '',
      api = new apiProto(),
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
  } else { // actual DOM append
    var coinLocalRate = 0,
        api = new apiProto(),
        coinBalance = coinBalances[coin] || 0;

    coinLocalRate = updateRates(coin.toUpperCase(), defaultCurrency, true) || 0;

    var currencyCalculatedValue = coinBalance * coinLocalRate,
        coinData = getCoinData(coin);

    if (!isActiveCoinSet && !activeCoin) activeCoin = coinData.id;
    if (coinData)
      result = accountCoinRepeaterTemplate.
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
    if ((isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') ||
        (!isIguana /*&& coinsInfo[key].connection === true*/ && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes')) {
      index++;
      if ($('.account-coins-repeater .' + key).html() && $('.account-coins-repeater .' + key)[0].outerHTML) sortedAccountCoinsRepeater = sortedAccountCoinsRepeater + $('.account-coins-repeater .' + key)[0].outerHTML;
    }
  }

  $('.account-coins-repeater').html(sortedAccountCoinsRepeater);
  bindClickInAccountCoinRepeater();

  // run balances and tx unit update once left sidebar is updated
  if (index === Object.keys(coinBalances).length) {
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
  var localStorage = new localStorageProto();

  $('.account-coins-repeater .item').each(function(index, item) {
    $(this).click(function() {
      $('.account-coins-repeater .item').filter(':visible').removeClass('active');

      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      } else {
        var oldActiveCoinVal = activeCoin;

        $(this).addClass('active');
        activeCoin = $(this).attr('data-coin-id');
        localStorage.setVal('iguana-active-coin', { id: activeCoin });

        if (oldActiveCoinVal !== activeCoin) {
          updateTransactionUnitBalance();
          constructTransactionUnitRepeater();
        }
      }
    });
  });
}