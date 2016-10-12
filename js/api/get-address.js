
apiProto.prototype.getAccountAddress = function(coin, account) {
  var result=false;

  if (dev.coinAccountsDev && !isIguana)
    if (dev.coinAccountsDev.coind[coin])
      account = dev.coinAccountsDev.coind[coin];

    var result = '';
    var fullUrl = apiProto.prototype.getFullApiRoute('getaccountaddress', account),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getaccountaddress', '\"' + account + '\"');
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj();

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    success: function(response) {
 	    result = response.result; // non-iguana
    }
  })

  return result;
}