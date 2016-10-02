/*!
 * Iguana api/balance
 *
 */

apiProto.prototype.getBalance = function(account, coin) {
  var result = false;

  // dev account lookup override
  if (coinAccountsDev && !isIguana)
    if (coinAccountsDev.coind[coin])
      account = coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('getbalance', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getbalance', coin === 'btcd' && !isIguana ? null : '\"' + account + '\"'), // avoid using account names in bitcoindarkd
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
      if (response.responseText)
        if (response.responseText.indexOf('Accounting API is deprecated') > -1 || response.responseText.indexOf('If you want to use accounting API'))
          if (showConsoleMessages && isDev && coin === 'btcd') console.log('add enableaccounts=1 and staking=0 in btcd conf file');
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response, coin) !== 10) {
      if (_response.result > -1 || Number(_response) === 0) {
        // non-iguana
        result = _response.result || _response;
      } else {
        if (showConsoleMessages && isDev) console.log(_response);

        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          console.log('error: ' + response.error);
          result = false;
        } else {
          if (response) result = response;
          else result = false;
        }
      }
    }
  });

  return result;
}