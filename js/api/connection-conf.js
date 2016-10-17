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
      'apiRoutes': { // deprecated, remove(?)
        'bitcoinRPC' : {
          'walletPassphrase' : 'bitcoinrpc/walletpassphrase', // params: password String, timeout Int
          'encryptWallet' : 'bitcoinrpc/encryptwallet', // params: passphrase String
          'listTransactions': 'bitcoinrpc/listtransactions', // params: account String, count: default is 1
          'getTransaction': 'bitcoinrpc/gettransaction', // params: txid String
          'getBalance': 'bitcoinrpc/getbalance' // params: account String
        },
        'iguana': {
          'addCoin': 'iguana/addcoin', // params newcoin, portp2p, services
          'rates': 'iguana/rates', // params: coin/curency or currency/currency or coin/coin, variable length
          'rate': 'iguana/rate' // params: base, rel e.g. base=BTC&rel=USD, !param values in CAPS!
        }
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