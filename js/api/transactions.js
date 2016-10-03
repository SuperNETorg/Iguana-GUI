/*!
 * Iguana api/transactions
 *
 */

apiProto.prototype.listTransactions = function(account, coin) {
  var result = false;

  // dev account lookup override
  if (dev.coinAccountsDev && !isIguana)
    if (dev.coinAccountsDev.coind[coin])
      account = dev.coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('listtransactions', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('listtransactions', '\"' + account + '\", ' + settings.defaultTransactionsCount - 1); // last 20 tx
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response, coin) !== 10) {
      if (dev.showConsoleMessages && dev.isDev) console.log(_response);

      if (_response.result) {
        // non-iguana
        if (_response.result.length) result = _response.result;
        else result = false;
      } else {
        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
          result = false;
        } else {
          if (response.result.length) result = response.result;
          else result = false;
        }
      }
    }
  });

  return result;
}

apiProto.prototype.getTransaction = function(txid, coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('gettransaction', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('gettransaction', '\"' + txid + '\"'),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);

    if (_response.result) {
      // non-iguana
      if (_response.result) result = _response.result;
      else result = false;
    } else {
      // iguana
      var response = _response;

      if (response.error) {
        // do something
        if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.txid) result = response;
        else result = false;
      }
    }
  });

  return result;
}