/*!
 * Iguana dashboard/transactions-unit
 *
 */

var transactionUnitRepeater = '<div class=\"item {{ status_class }} {{ timestamp_format }} {{ txid }}\" title=\"confirmations: {{ confs }}\">' +
                                '<div class=\"status unselectable\">{{ status }}</div>' +
                                '<div class=\"amount unselectable\">' +
                                  '<span class=\"in-out {{ in_out }}\"></span>' +
                                  '<span class=\"value\">{{ amount }}</span>' +
                                  '<span class=\"coin-name\">{{ coin }}</span>' +
                                '</div>' +
                                '<div class=\"progress-status unselectable\">' +
                                  '<i class=\"icon\"></i>' +
                                '</div>' +
                                '<div class=\"hash\">{{ hash }}</div>' +
                                '<div class=\"timestamp unselectable\">{{ timestamp_single }}</div>' +
                                '<div class=\"timestamp two-lines unselectable\">' +
                                  '<div class=\"timestamp-date\">{{ timestamp_date }}</div>' +
                                  '<div class=\"timestamp-time\">{{ timestamp_time }}</div>' +
                                '</div>' +
                              '</div>';

// construct transaction unit array
function constructTransactionUnitRepeater(update) {
  var coinName = activeCoin || $('.account-coins-repeater .item.active');

  // disable send button if ther're no funds on a wallet
  if (Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()) <= 0) {
    $('.transactions-unit .action-buttons .btn-send').addClass('disabled');
  } else {
    $('.transactions-unit .action-buttons .btn-send').removeClass('disabled');
  }

  if (!update) $('.transactions-list-repeater').html(loaderIconTemplate); // loader spinner

  if ((coinName.length && coinName.length !== 0) || activeCoin) api.listTransactions(defaultAccount, coinName.toLowerCase(), constructTransactionUnitRepeaterCB, update);
}

/*
 *  new tx will appear at the top of the list
 *  while old tx are going to be removed from the list
 */
function constructTransactionUnitRepeaterCB(response, update) {
  var result = '',
      prependContent = '',
      coinName = activeCoin || $('.account-coins-repeater .item.active');

  if (coinName.length) {
    var transactionsList = response; /*api.listTransactions(defaultAccount, coinName.toLowerCase());*/
    // sort tx in desc order by timestamp
    if (transactionsList) {
      if (transactionsList[0].time) transactionsList.sort(function(a, b) { return b.time - a.time }); // coind
      if (transactionsList[0].blocktime) transactionsList.sort(function(a, b) { return b.blocktime - a.blocktime }); // iguana

      if ($('.transactions-list-repeater').html().indexOf('No trasaction history is available') > -1 ||
          $('.transactions-list-repeater').html().indexOf('Loading') > -1 ||
          $('.transactions-list-repeater').html().indexOf(coinName.toUpperCase()) === -1) $('.transactions-list-repeater').html('');

      for (var i=0; i < transactionsList.length; i++) {
        result = '';
        if (transactionsList[i].txid) {
          // TODO: add func to evaluate tx time in seconds/minutes/hours/a day from now e.g. 'a moment ago', '1 day ago' etc
          // timestamp is converted to 24h format
          var /*transactionDetails = api.getTransaction(transactionsList[i].txid),*/
              transactionDetails = transactionsList[i],
              txIncomeOrExpenseFlag = '',
              txStatus = 'N/A',
              txCategory = '',
              txAddress = '',
              txAmount = 'N/A';

          if (transactionDetails)
            if (transactionDetails.details) {
              txAddress = transactionDetails.details[0].address;
              txAmount = transactionDetails.details[0].amount;
              // non-iguana
              if (transactionDetails.details[0].category)
                txCategory = transactionDetails.details[0].category;

                if (transactionDetails.details[0].category === 'send') {
                  txIncomeOrExpenseFlag = 'bi_interface-minus';
                  txStatus = 'sent';
                } else {
                  txIncomeOrExpenseFlag = 'bi_interface-plus';
                  txStatus = 'received';
                }
            } else {
              // iguana
              txAddress = transactionsList[i].address || transactionDetails.address;
              txAmount = transactionsList[i].amount;
              txStatus = transactionDetails.category || transactionsList[i].category;
              txCategory = transactionDetails.category || transactionsList[i].category;

              if (txStatus === 'send') {
                txIncomeOrExpenseFlag = 'bi_interface-minus';
                txStatus = 'sent';
              } else {
                txIncomeOrExpenseFlag = 'bi_interface-plus';
                txStatus = 'received';
              }
            }

          if (transactionDetails /*&& txStatus !== 'N/A'*/) {
            if (Number(transactionDetails.confirmations) && Number(transactionDetails.confirmations) < settings.txUnitProgressStatusMinConf) {
              txStatus = 'in process';
              txCategory = 'process';
            }
            if ($('.transactions-list-repeater').html().indexOf(transactionDetails.txid) > -1) {
              $('.transactions-list-repeater .' + transactionDetails.txid + ' .status').html(txStatus);
              $('.transactions-list-repeater .' + transactionDetails.txid).removeClass('receive').removeClass('send').removeClass('process').addClass(txCategory);
              $('.transactions-list-repeater .' + transactionDetails.txid + ' .in-out').removeClass('bi_interface-minus').removeClass('bi_interface-plus').addClass(txIncomeOrExpenseFlag);
              $('.transactions-list-repeater .' + transactionDetails.txid).attr('title', 'confirmations: ' + (transactionDetails.confirmations ? transactionDetails.confirmations : 'n/a'));
            } else {
              if (isIguana && txAmount !== undefined || !isIguana)
                result = transactionUnitRepeater.
                         replace('{{ txid }}', transactionDetails.txid).
                         replace('{{ status }}', txStatus).
                         replace('{{ status_class }}', txCategory).
                         replace('{{ confs }}', transactionDetails.confirmations ? transactionDetails.confirmations : 'n/a').
                         replace('{{ in_out }}', txIncomeOrExpenseFlag).
                         replace('{{ amount }}', txAmount > 0 ? Math.abs(txAmount.toFixed(decimalPlacesTxUnit)) : Math.abs(txAmount)).
                         replace('{{ timestamp_format }}', 'timestamp-multi').
                         replace('{{ coin }}', coinName.toUpperCase()).
                         replace('{{ hash }}', txAddress !== undefined ? txAddress : 'N/A').
                         replace('{{ timestamp_date }}', helper.convertUnixTime(transactionDetails.blocktime ||
                                                                                transactionDetails.timestamp ||
                                                                                transactionDetails.time, 'DDMMMYYYY')).
                         replace('{{ timestamp_time }}', helper.convertUnixTime(transactionDetails.blocktime ||
                                                                                transactionDetails.timestamp ||
                                                                                transactionDetails.time, 'HHMM'));

              if (update) {
                prependContent = prependContent + result;
              } else {
                $('.transactions-list-repeater').append(result);
              }
            }
          }
        }
      }

      /*
       *  add N new tx at the top of the list
       *  remove N old tx form the bottom of the list
       */
      if ($(prependContent).find('.icon').length) {
        $('.transactions-list-repeater .item:gt(' + ($('.transactions-list-repeater .item').length - $(prependContent).find('.icon').length - 1) + ')').remove();
        $('.transactions-list-repeater').prepend(prependContent);
      }
    }

    applyDashboardResizeFix();

    if (!transactionsList.length) result = 'No trasaction history is available';
  }
}