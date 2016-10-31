/*!
 * Iguana dashboard/transactions-unit
 *
 */

// construct transaction unit array
function constructTransactionUnitRepeater(update) {
  var coinName = activeCoin || $('.account-coins-repeater .item.active');

  // disable send button if ther're no funds on a wallet
  if (Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()) <= 0) {
    $('.transactions-unit .action-buttons .btn-send').addClass('disabled');
  } else {
    $('.transactions-unit .action-buttons .btn-send').removeClass('disabled');
  }

  if (!update) $('.transactions-list-repeater').html(templates.all.loader); // loader spinner

  if ((coinName.length && coinName.length !== 0) || activeCoin) api.listTransactions(defaultAccount, coinName.toLowerCase(), constructTransactionUnitRepeaterCB, update);
}

/*
 *  new tx will appear at the top of the list
 *  while old tx are going to be removed from the list
 */
function constructTransactionUnitRepeaterCB(response, update) {
  var result = '',
      prependContent = '',
      coinName = activeCoin || $('.account-coins-repeater .item.active'),
      txUnitRepeaterClass = '.transactions-list-repeater';

  if (coinName.length) {
    var transactionsList = response; /*api.listTransactions(defaultAccount, coinName.toLowerCase());*/
    // sort tx in desc order by timestamp
    if (transactionsList) {
      if (transactionsList[0].time) transactionsList.sort(function(a, b) { return b.time - a.time }); // coind
      if (transactionsList[0].blocktime) transactionsList.sort(function(a, b) { return b.blocktime - a.blocktime }); // iguana

      if ($(txUnitRepeaterClass).html().indexOf(helper.lang('DASHBOARD.NO_TRANSACTION_HISTORY_IS_AVAILABLE')) > -1 ||
          $(txUnitRepeaterClass).html().indexOf(helper.lang('DASHBOARD.LOADING')) > -1 ||
          $(txUnitRepeaterClass).html().indexOf(coinName.toUpperCase()) === -1) $(txUnitRepeaterClass).html('');

      for (var i=0; i < transactionsList.length; i++) {
        result = '';
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

          if (transactionDetails /*&& txStatus !== 'N/A'*/) {
            if (Number(transactionDetails.confirmations) && Number(transactionDetails.confirmations) < settings.txUnitProgressStatusMinConf) {
              txStatus = helper.lang('DASHBOARD.IN_PROCESS');
              txCategory = 'process';
            }
            if ($(txUnitRepeaterClass).html().indexOf(transactionDetails.txid) > -1) {
              $(txUnitRepeaterClass + ' .' + transactionDetails.txid + ' .status').html(txStatus);
              $(txUnitRepeaterClass + ' .' + transactionDetails.txid).removeClass('receive').removeClass('send').removeClass('process').addClass(txCategory);
              $(txUnitRepeaterClass + ' .' + transactionDetails.txid + ' .in-out').removeClass(iconSentClass).removeClass(iconReceivedClass).addClass(txIncomeOrExpenseFlag);
              $(txUnitRepeaterClass + ' .' + transactionDetails.txid).attr('title', 'confirmations: ' + (transactionDetails.confirmations ? transactionDetails.confirmations : 'n/a'));
            } else {
              if (isIguana && txAmount !== undefined || !isIguana)
                result = templates.all.repeaters.transactionsUnitItem.
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
                $(txUnitRepeaterClass).append(result);
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
        $(txUnitRepeaterClass + ' .item:gt(' + ($(txUnitRepeaterClass + ' .item').length - $(prependContent).find('.icon').length - 1) + ')').remove();
        $(txUnitRepeaterClass).prepend(prependContent);
      }
    }

    applyDashboardResizeFix();

    if (coinsInfo[coinName].connection === true && coinsInfo[coinName].RT === true) {
      if (!transactionsList.length) $(txUnitRepeaterClass).html(helper.lang('DASHBOARD.NO_TRANSACTION_HISTORY_IS_AVAILABLE'));
    }

    if ($(txUnitRepeaterClass).html().indexOf('loader') === -1) $('.transactions-unit').removeClass('loading');
  }
}