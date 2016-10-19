/*!
 * Iguana api/connection-conf
 *
 */

apiProto.prototype.getConf = function(discardCoinSpecificPort, coin) {
  var conf = {
      'server': {
        'protocol': 'http://',
        'ip': 'localhost',
        'iguanaPort': settings.iguanaPort
      },
      'coins': supportedCoinsList
  };

  // coin port switch hook
  if (coin && conf.coins[coin].coindPort && !isIguana) {
    conf.server.port = conf.coins[coin].coindPort;

    return conf;
  }

  if (activeCoin && !discardCoinSpecificPort) {
    conf.server.port = conf.coins[activeCoin].portp2p;
    if (!isIguana)
      if (conf.coins[activeCoin].coindPort) conf.server.port = conf.coins[activeCoin].coindPort;
  } else {
    conf.server.port = conf.server.iguanaPort;
  }

  if (coin) conf.server.port = conf.coins[coin].portp2p;

  return conf;
}