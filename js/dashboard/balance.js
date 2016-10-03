/*!
 * Iguana dashboard/balance
 *
 */

function updateTotalBalance() {
  var totalBalance = 0;

  $('.account-coins-repeater .item').each(function(index, item) {
    var coin = $(this).attr('data-coin-id'),
        coinValue = $(this).find('.coin-value .val'),
        currencyValue = $(this).find('.currency-value .val');

    totalBalance += Number(coinValue.html()) * updateRates(coin.toUpperCase(), null, true);
  });

  $('.balance-block .balance .value').html(totalBalance.toFixed(decimalPlacesCurrency));
  $('.balance-block .balance .currency').html(defaultCurrency);
}

function updateTransactionUnitBalance(isAuto) {
  var selectedCoin = $('.account-coins-repeater .item.active'),
      currentCoinRate = isAuto ? updateRates(selectedCoin.attr('data-coin-id').toUpperCase()) : parseFloat($('.account-coins-repeater .item.active .currency-value .val').html()) / parseFloat($('.account-coins-repeater .item.active .coin-value .val').html(), null, true);
      selectedCoinValue = Number($('.account-coins-repeater .item.active .coin-value .val').html()) ? Number($('.account-coins-repeater .item.active .coin-value .val').html()) : 0;
      curencyValue = (selectedCoinValue * currentCoinRate).toFixed(decimalPlacesCurrency);

  if (selectedCoin.length !== 0) {
    $('.transactions-unit .active-coin-balance .value').html(selectedCoinValue.toFixed(decimalPlacesCoin));
    $('.transactions-unit .active-coin-balance .coin-name').html(selectedCoin.attr('data-coin-id').toUpperCase());
    $('.transactions-unit .active-coin-balance-currency .value').html(curencyValue !== 'NaN' ? curencyValue : (0.00).toFixed(decimalPlacesCurrency));
    $('.transactions-unit .active-coin-balance-currency .currency').html(defaultCurrency.toUpperCase());
  }

  if (selectedCoinValue === 0) $('.transactions-unit .action-buttons .btn-send').hide();
  else $('.transactions-unit .action-buttons .btn-send').show();
}