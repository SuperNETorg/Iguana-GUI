/*!
 * Iguana api/wallet-auth
 *
 */

apiProto.prototype.walletLogin = function(passphrase, timeout, coin, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletpassphrase', null, coin),
      defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort + '/api/bitcoinrpc/walletpassphrase',
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletpassphrase', '\"' + passphrase + '\", ' + timeout),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: isIguana ? defaultIguanaServerUrl : fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    success: function(response) {
      if (showConsoleMessages && isDev) console.log(response);
      result = true;
      if (cb) cb.call(this, result, coin);
    },
    error: function(response) {
      if (response.responseText) {
        if (response.responseText.indexOf('Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.') > -1) result = true;
        if (response.responseText.indexOf('Error: The wallet passphrase entered was incorrect') > -1) result = -14;
        if (response.responseText.indexOf('Error: running with an unencrypted wallet, but walletpassphrase was called') > -1) result = -15;
        if (showConsoleMessages && isDev) console.log(response.responseText);
      } else {
        if (showConsoleMessages && isDev) console.log(response.error);
      }
      if (cb) cb.call(this, result, coin);
    }
  });

  return result;
}

/*
  current implementation doesn't require async as only one iguana/coind wallet can be encrypted at any given time
*/
apiProto.prototype.walletEncrypt = function(passphrase, coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('encryptwallet', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('encryptwallet', '\"' + passphrase + '\"'),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: true,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      if (response.responseText) {
        if (response.responseText.indexOf(':-15') > -1) result = -15;
        if (showConsoleMessages && isDev) console.log(response.responseText);
      } else {
        if (showConsoleMessages && isDev) console.log(response);
      }
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);
    if (showConsoleMessages && isDev) console.log(_response);

    if (_response.result) {
      // non-iguana
      if (_response.result) result = _response.result;
      else result = false;
    } else {
      // iguana
      var response = $.parseJSON(_response);

      if (response.error) {
        // do something
        if (showConsoleMessages && isDev) console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.result === 'success') result = response;
        else result = false;
      }
    }
  });

  return result;
}

apiProto.prototype.walletLock = function(coin, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletlock', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletlock'),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);

    if (_response.result) {
      // non-iguana
      result = _response.result;
    } else {
      if (showConsoleMessages && isDev) console.log(_response);

      // iguana
      var response = typeof _response === 'object' ? _response : $.parseJSON(_response);

      if (response.error) {
        // do something
        if (showConsoleMessages && isDev) console.log('error: ' + response.error);
        result = false;
      } else {
        if (response) result = response;
        else result = false;
      }
    }

    if (cb) cb.call();
  });

  return result;
}