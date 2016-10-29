/*!
 * Iguana dashboard/balance
 *
 */

function updateTotalBalance() {
  var totalBalance = 0,
      balanceBlockClassName = '.balance-block .balance';

  $('.account-coins-repeater .item').each(function(index, item) {
    var coin = $(this).attr('data-coin-id'),
        coinValue = $(this).find('.coin-value .val'),
        currencyValue = $(this).find('.currency-value .val');

    totalBalance += coinBalances[coin] * updateRates(coin.toUpperCase(), null, true);
  });

  var totalBalanceDecimals = helper.decimalPlacesFormat(totalBalance).currency;
  $(balanceBlockClassName + ' .value').html(totalBalance.toFixed(totalBalanceDecimals) !== 'NaN' ? totalBalance.toFixed(totalBalanceDecimals) : 0.00);
  $(balanceBlockClassName + ' .currency').html(defaultCurrency);
}

function updateTransactionUnitBalance(isAuto) {
  var accountCoinsRepeaterActiveClassName = '.account-coins-repeater .item.active';
      selectedCoin = $(accountCoinsRepeaterActiveClassName),
      coinName = selectedCoin.attr('data-coin-id'),
      _currencyValue = $(accountCoinsRepeaterActiveClassName + ' .currency-value .val').html(),
      currentCoinRate = isAuto ? updateRates(coinName.toUpperCase()) : parseFloat(_currencyValue) / parseFloat(_currencyValue, null, true);
      _coinValue = $(accountCoinsRepeaterActiveClassName + ' .coin-value .val').html()
      selectedCoinValue = Number(_coinValue) ? Number(_coinValue) : (0.00).toFixed(helper.decimalPlacesFormat(0).coin);
      curencyValue = (selectedCoinValue * currentCoinRate).toFixed(helper.decimalPlacesFormat((selectedCoinValue * currentCoinRate)).currency);

  var txUnitActiveCoinBalanceElName = '.transactions-unit .active-coin-balance';
  if (selectedCoin.length !== 0) {
    $(txUnitActiveCoinBalanceElName + ' .value').html(Number(selectedCoinValue).toFixed(helper.decimalPlacesFormat(selectedCoinValue).coin));
    $(txUnitActiveCoinBalanceElName + ' .coin-name').html(coinName.toUpperCase());
    $(txUnitActiveCoinBalanceElName + '-currency .value').html(curencyValue !== 'NaN' ? curencyValue : (0.00).toFixed(helper.decimalPlacesFormat(0).currency));
    $(txUnitActiveCoinBalanceElName + '-currency .currency').html(defaultCurrency.toUpperCase());
  }

  var buttonSend = $('.transactions-unit .action-buttons .btn-send');
  if (selectedCoinValue === 0) buttonSend.hide();
  else buttonSend.show();

  // enable loader spinner if coin is out of sync/not connected
  var txUnit = $('.transactions-unit'),
      loadingClassName = 'loading';
  if (coinName && coinsInfo[coinName].connection === true && coinsInfo[coinName].RT === true) {
    txUnit.removeClass(loadingClassName);
  } else {
    txUnit.addClass(loadingClassName);
  }
}