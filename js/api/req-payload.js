/*!
 * Iguana api/req-payload
 *
 */

apiProto.prototype.getServerUrl = function(discardCoinSpecificPort) {
  return apiProto.prototype.getConf().server.protocol +
         apiProto.prototype.getConf().server.ip + ':' +
         apiProto.prototype.getConf(discardCoinSpecificPort).server.port + '/api/';
}

apiProto.prototype.getBasicAuthHeaderObj = function(conf, coin) {
  if (conf)
    return isIguana ? '' : { 'Authorization': 'Basic ' + btoa(conf.user + ':' + conf.pass) };
  else
    if (activeCoin || coin)
      return isIguana ? '' : { 'Authorization': 'Basic ' + btoa(apiProto.prototype.getConf().coins[coin ? coin : activeCoin].user + ':' +
                                                                apiProto.prototype.getConf().coins[coin ? coin : activeCoin].pass) };
}

apiProto.prototype.getBitcoinRPCPayloadObj = function(method, params, coin) {
  if (isIguana)
    return '{ ' + (coin ? ('\"coin\": \"' + coin.toUpperCase() + '\", ') : '') + '\"method\": \"' + method + '\", \"immediate\": \"1000\", \"params\": [' + (!params ? '' : params) + '] }';
  else
    return '{ \"agent\": \"bitcoinrpc\",' +
              '\"method\": \"' + method + '\", \"timeout\": \"2000\", \"params\": [' + (!params ? '' : params) + '] }';
}

apiProto.prototype.getFullApiRoute = function(method, conf, coin) {
  if (conf)
    return isIguana ? (apiProto.prototype.getConf().server.protocol +
                      apiProto.prototype.getConf().server.ip + ':' +
                      conf.portp2p + '/api/bitcoinrpc/' + method) : (settings.proxy +
                      apiProto.prototype.getConf().server.ip + ':' +
                      (conf.coindPort ? conf.coindPort : conf.portp2p));
  else
    return isIguana ? (apiProto.prototype.getConf().server.protocol +
                      apiProto.prototype.getConf().server.ip + ':' +
                      apiProto.prototype.getConf(true).server.port /*getConf(false, coin).server.port*/ + '/api/bitcoinrpc/' + method) : (settings.proxy +
                      apiProto.prototype.getConf().server.ip + ':' +
                      apiProto.prototype.getConf(false, coin).server.port);
}