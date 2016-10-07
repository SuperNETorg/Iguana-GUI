/*!
 * Iguana dashboard/transactions-unit
 *
 */

var transactionUnitRepeater = '<div class=\"item {{ status_class }} {{ timestamp_format }}\">' +
                                '<div class=\"status\">{{ status }}</div>' +
                                '<div class=\"amount\">' +
                                  '<span class=\"in-out {{ in_out }}\"></span>' +
                                  '<span class=\"value\">{{ amount }}</span>' +
                                  '<span class=\"coin-name\">{{ coin }}</span>' +
                                '</div>' +
                                '<div class=\"progress-status\">' +
                                  '<i class=\"icon\"></i>' +
                                '</div>' +
                                '<div class=\"hash\">{{ hash }}</div>' +
                                '<div class=\"timestamp\">{{ timestamp_single }}</div>' +
                                '<div class=\"timestamp two-lines\">' +
                                  '<div class=\"timestamp-date\">{{ timestamp_date }}</div>' +
                                  '<div class=\"timestamp-time\">{{ timestamp_time }}</div>' +
                                '</div>' +
                              '</div>';

// construct transaction unit array
function constructTransactionUnitRepeater() {
  var api = new apiProto(),
      coinName = activeCoin || $('.account-coins-repeater .item.active');

  api.listTransactions(defaultAccount, coinName.toLowerCase(), constructTransactionUnitRepeaterCB);
}

function constructTransactionUnitRepeaterCB(response) {
  var result = '',
      helper = new helperProto(),
      coinName = activeCoin || $('.account-coins-repeater .item.active');

  if (coinName.length) {
    var transactionsList = response; /*api.listTransactions(defaultAccount, coinName.toLowerCase());*/
    // sort tx in desc order by timestamp
    if (transactionsList) {
      if (transactionsList[0].time) transactionsList.sort(function(a, b) { return b.time - a.time }); // coind
      if (transactionsList[0].blocktime) transactionsList.sort(function(a, b) { return b.blocktime - a.blocktime }); // iguana

      for (var i=0; i < transactionsList.length; i++) {
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

          if (transactionDetails && txStatus !== 'N/A') {
            result += transactionUnitRepeater.replace('{{ status }}', txStatus).
                                              replace('{{ status_class }}', txCategory).
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
          }
        }
      }
    }

    if (!transactionsList.length) result = 'No trasaction history is available';
  }

  $('.transactions-list-repeater').html(result);
  //return result;
}