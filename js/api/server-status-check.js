/*!
 * Iguana api/server-status-check
 *
 */

apiProto.prototype.coindCheckRT = function(coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('getblocktemplate', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getblocktemplate'),
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
      if (response.responseText.indexOf(':-10') === -1) result = true;
      else result = false;
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);

    if (_response.result.bits) result = true;
    else result = false;
  });

  return result;
}

/* external block explorer website */
apiProto.prototype.getCoinCurrentHeight = function(coin) {
  var result = false;

  if (apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource !== 'disabled')
    $.ajax({
      url: apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource,
      cache: false,
      dataType: 'text',
      async: false
    })
    .done(function(_response) {
      var response = $.parseJSON(_response);

      if (response.blockcount || response.info || response.height || response.data || response[coin] || response.blocks) {
        if (response.blockcount) result = response.blockcount;
        if (response.info) result = response.info.blocks;
        if (response.height) result = response.height;
        if (response.blocks) result = response.blocks;
        if (response.data) result = response.data.last_block.nb;
        if (response[coin]) result = response[coin].height;
      } else {
        if (dev.showConsoleMessages && dev.isDev) console.log('error retrieving current block height from ' + apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource);
        result = false;
      }
    });
  else
    result = 'NA';

  return result;
}