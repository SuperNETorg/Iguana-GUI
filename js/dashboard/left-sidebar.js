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

// construct account coins array
function constructAccountCoinRepeater() {
  var result = '',
      localStorage = new localStorageProto(),
      helper = new helperProto(),
      accountCoinRepeaterHTML = '',
      isActiveCoinSet = accountCoinRepeaterHTML.indexOf('item active') > -1 ? true : false;

  if (!$('.account-coins-repeater .item').length) coinsSelectedByUser[0] = defaultCoin.toLowerCase();

  var index = 0;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      if ((!isIguana && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') || isIguana) {
        coinsSelectedByUser[index] = key;
        index++;
      }
    }
  };

  for (var i=0; i < coinsSelectedByUser.length; i++) {
    if (accountCoinRepeaterHTML.indexOf('data-coin-id=\"' + coinsSelectedByUser[i] + '\"') === -1) {
      var coinLocalRate = coinToCurrencyRate,
          api = new apiProto(),
          coinBalance = api.getBalance(defaultAccount, coinsSelectedByUser[i]) || 0;

      if (coinsSelectedByUser[i].toUpperCase() !== defaultCoin) coinLocalRate = updateRates(coinsSelectedByUser[i].toUpperCase(), null, true) || 0;

      var currencyCalculatedValue = coinBalance * coinLocalRate,
          coinData = getCoinData(coinsSelectedByUser[i]);

      if ((i === 0 && !isActiveCoinSet) && !activeCoin) activeCoin = coinData.id;
      if (coinData)
        result += accountCoinRepeaterTemplate.replace('{{ id }}', coinData.id.toUpperCase()).
                                              replace('{{ name }}', coinData.name).
                                              replace('{{ coin_id }}', coinData.id.toLowerCase()).
                                              replace('{{ coin_id }}', coinData.id.toUpperCase()).
                                              replace('{{ currency_name }}', defaultCurrency).
                                              replace('{{ coin_value }}', coinBalance ? coinBalance.toFixed(helper.decimalPlacesFormat(coinBalance).coin) : 0).
                                              replace('{{ currency_value }}', currencyCalculatedValue ? currencyCalculatedValue.toFixed(helper.decimalPlacesFormat(currencyCalculatedValue).currency) : 0).
                                              replace('{{ active }}', activeCoin === coinData.id ? ' active' : '');
    }
  }

  return result;
}

function updateAccountCoinRepeater() {
  $('.account-coins-repeater .item').each(function(index, item) {
    var coin = $(this).attr('data-coin-id'),
        coinValue = $(this).find('.coin-value .val'),
        currencyValue = $(this).find('.currency-value .val'),
        currenyValueCalculated = (Number(coinValue.html()) * updateRates(coin.toUpperCase(), null, true)).toFixed(decimalPlacesCurrency);

    currencyValue.html(Number(currenyValueCalculated) ? currenyValueCalculated : 0);
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
          $('.transactions-list-repeater').html(constructTransactionUnitRepeater());
        }
      }
    });
  });
}