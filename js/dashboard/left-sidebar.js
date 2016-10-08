/*!
 * Iguana dashboard/left-sidebar
 *
 */

var accountCoinRepeaterTemplate = '<div class=\"item{{ active }}\" data-coin-id=\"{{ coin_id }}\">' +
                                    '<div class=\"coin\">' +
                                      '<i class=\"icon cc {{ id }}-alt\"></i>' +
                                      '<span class=\"name\">{{ name }}</span>' +
                                    '</div>' +
                                    '<div class=\"balance\">' +
                                      '<div class=\"coin-value\"><span class=\"val\">{{ coin_value }}</span> {{ coin_id }}</div>' +
                                      '<div class=\"currency-value\"><span class=\"val\">{{ currency_value }}</span> {{ currency_name }}</div>' +
                                    '</div>' +
                                  '</div>';

var coinBalances = [];

function constructAccountCoinRepeater() {
  var api = new apiProto(),
  localStorage = new localStorageProto();

  var index = 0;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      if ((!isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') || isIguana) {
        coinsSelectedByUser[index] = key;
        index++;
      }
    }
  };

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
      isActiveCoinSet = accountCoinRepeaterHTML.indexOf('item active') > -1 ? true : false;

  coinBalances[coin] = balance;

  var i = 0;
  for (var key in coinsInfo) {
    if (accountCoinRepeaterHTML.indexOf('data-coin-id=\"' + key + '\"') === -1 && coinBalances[key] >= 0) {

      var coinLocalRate = coinToCurrencyRate,
          api = new apiProto(),
          coinBalance = coinBalances[key] || 0; //api.getBalance(defaultAccount, coinsSelectedByUser[i]) || 0;

      if (key.toUpperCase() !== defaultCoin) coinLocalRate = updateRates(key.toUpperCase(), null, true) || 0;

      var currencyCalculatedValue = coinBalance * coinLocalRate,
          coinData = getCoinData(key);

      if ((i === 0 && !isActiveCoinSet) && !activeCoin) activeCoin = coinData.id;
      if (coinData)
        i++;
        result += accountCoinRepeaterTemplate.replace('{{ id }}', coinData.id.toUpperCase()).
                                              replace('{{ name }}', coinData.name).
                                              replace('{{ coin_id }}', coinData.id.toLowerCase()).
                                              replace('{{ coin_id }}', coinData.id.toUpperCase()).
                                              replace('{{ currency_name }}', defaultCurrency).
                                              replace('{{ coin_value }}', coinBalance ? coinBalance.toFixed(helper.decimalPlacesFormat(coinBalance).coin) : 0).
                                              replace('{{ currency_value }}', currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency)).
                                              replace('{{ active }}', activeCoin === coinData.id ? ' active' : '');
    }
  }

  /* ! not efficient ! */
  $('.account-coins-repeater').html(result);
  bindClickInAccountCoinRepeater();
  if (activeCoin === getCoinData(coin).id) constructTransactionUnitRepeater();
  updateTotalBalance();
  updateTransactionUnitBalance();
}

function updateAccountCoinRepeater() {
  $('.account-coins-repeater .item').each(function(index, item) {
    var helper = new helperProto(),
        coin = $(this).attr('data-coin-id'),
        coinValue = $(this).find('.coin-value .val'),
        currencyValue = $(this).find('.currency-value .val'),
        currenyValueCalculated = (Number(coinValue.html()) * updateRates(coin.toUpperCase(), null, true));

    currencyValue.html(Number(currenyValueCalculated) ? currenyValueCalculated.toFixed(helper.decimalPlacesFormat(currenyValueCalculated).currency) : (0.00).toFixed(helper.decimalPlacesFormat(0).currency));
  });
}

function bindClickInAccountCoinRepeater() {
  $('.account-coins-repeater .item').each(function(index, item) {
    $(this).click(function() {
      $('.account-coins-repeater .item').filter(':visible').removeClass('active');
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      } else {
        var oldActiveCoinVal = activeCoin;

        $(this).addClass('active');
        activeCoin = $(this).attr('data-coin-id');

        if (oldActiveCoinVal !== activeCoin) {
          updateTransactionUnitBalance();
          constructTransactionUnitRepeater();
          //$('.transactions-list-repeater').html(constructTransactionUnitRepeater());
        }
      }
    });
  });
}