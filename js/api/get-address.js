
apiProto.prototype.getAccountAddress = function(coin, account) {
  var result = false;

  if (dev.coinAccountsDev && !isIguana)
    if (dev.coinAccountsDev.coind[coin])
      account = dev.coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('getaccountaddress', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getaccountaddress', '\"' + account + '\"', coin);
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

      if (dev.showConsoleMessages && dev.isDev) console.log(response);
    },
    success: function(response) {
      console.log(response);
      // iguana
      if (response.address) result = response.address;
      else result = response.result; // non-iguana
    }
  })

  return result;
}