/*!
 * Iguana api config
 *
 */

// TODO: 1) add response handler
//       2) generalize get/post functions into one
//       3) add localstorage hook on testPort success
//      (?) refactor conf into a singleton obj

var apiProto = function() {};

var activeCoin,
    portsTested = false,
    isIguana = false,
    isRT = false,
    coinsInfo = []; // cointains coin related info

apiProto.prototype.getConf = function(discardCoinSpecificPort, coin) {
  var conf = {
      'server': {
        'protocol': 'http://',
        'ip': 'localhost',
        'iguanaPort': '7778'
      },
      'apiRoutes': {
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

apiProto.prototype.errorHandler = function(response, index) {
  if (response.error === 'need to unlock wallet') {
    if (helperProto.prototype.getCurrentPage() !== 'index')
      $('#temp-out-of-sync').html('Something went wrong. Please login again.');
      $('#temp-out-of-sync').removeClass('hidden');
      setTimeout(function() {
        helperProto.prototype.logout();
      }, 1000);

    return 10;
  }
  if (response.error === 'iguana jsonstr expired') {
    console.log('server is busy');

    return 10;
  }
  if (response.error === 'coin is busy processing') {
    if ($('#debug-sync-info') && index !== undefined) {
      if (!coinsInfo[index]) coinsInfo[index] = [];
      coinsInfo[index].connection = true;

      if ($('#debug-sync-info').html().indexOf('coin ' + index) === -1)
        $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');
    }

    console.log('server is busy');

    return 10;
  }
  if (response.error === 'null return from iguana_bitcoinRPC') {
    console.log('iguana crashed?');

    return 10;
  }
}

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

apiProto.prototype.getBitcoinRPCPayloadObj = function(method, params) {
  return '{ \"agent\": \"bitcoinrpc\",' +
            '\"method\": \"' + method + '\", ' +
            (!isIguana ? '\"timeout\": \"30000\"' : '\"immediate\": \"100\"') + ', ' +
            '\"params\": [' + (!params ? '' : params) + '] }';
}

apiProto.prototype.getFullApiRoute = function(method, conf, coin) {
  if (conf)
    return isIguana ? (apiProto.prototype.getConf().server.protocol +
                      apiProto.prototype.getConf().server.ip + ':' +
                      conf.portp2p + '/api/bitcoinrpc/' + method) : (proxy +
                      apiProto.prototype.getConf().server.ip + ':' +
                      (conf.coindPort ? conf.coindPort : conf.portp2p));
  else
    return isIguana ? (apiProto.prototype.getConf().server.protocol +
                      apiProto.prototype.getConf().server.ip + ':' +
                      apiProto.prototype.getConf(false, coin).server.port + '/api/bitcoinrpc/' + method) : (proxy +
                      apiProto.prototype.getConf().server.ip + ':' +
                      apiProto.prototype.getConf(false, coin).server.port);
}

// test must be hooked to initial gui start or addcoin method
// test 1 port for a single coin
apiProto.prototype.testCoinPorts = function() {
  var result = false,
      _index = 0;
  $('#debug-sync-info').html('');

  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    var fullUrl = apiProto.prototype.getFullApiRoute('getinfo', conf),
        postData = apiProto.prototype.getBitcoinRPCPayloadObj('getinfo'),
        postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(conf);

    if (!coinsInfo[index]) coinsInfo[index] = [];
    coinsInfo[index].connection = false;

    $.ajax({
      url: fullUrl,
      cache: false,
      async: false,
      dataType: 'json',
      type: 'POST',
      data: postData,
      headers: postAuthHeaders,
      timeout: '500',
      success: function(response) {
        apiProto.prototype.errorHandler(response, index);
        console.log(response);

        if (response.error === 'coin is busy processing') {
          coinsInfo[index].connection = true;
          coinsInfo[index].RT = false;
        }

        if (response.result.walletversion || response.result === 'success') {
          console.log('portp2p con test passed');
          console.log(index + ' daemon is detected');
          coinsInfo[index].connection = true;

          // non-iguana
          // sync info
          if (!isIguana) {
            var networkCurrentHeight = 0, //apiProto.prototype.getCoinCurrentHeight(index); temp disabled
                coindCheckRTResponse = apiProto.prototype.coindCheckRT(index),
                syncPercentage = (response.result.blocks * 100 / networkCurrentHeight).toFixed(2);

            console.log('Connections: ' + response.result.connections);
            console.log('Blocks: ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== "Infinity" ? syncPercentage : 'N/A ') + '% synced)');

            if (response.result.blocks === networkCurrentHeight || coindCheckRTResponse) {
              isRT = true;
              coinsInfo[index].RT = true;
            } else {
              isRT = false;
              coinsInfo[index].RT = false;
              console.log('RT is not ready yet!');
            }

            if (isDev && showSyncDebug)
              if ($('#debug-sync-info').html().indexOf('coin: ' + index) < 0)
                $('#debug-sync-info').append('coin: ' + index + ', con ' + response.result.connections + ', blocks ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== "Infinity" ? syncPercentage : 'N/A ') + '% synced), RT: ' + (isRT ? 'yes' : 'no') + '<br/>');
          }
        }
        if (response.status && isIguana) {
          var iguanaGetInfo = response.status.split(' '),
              totalBundles = iguanaGetInfo[20].split(':'),
              currentHeight = iguanaGetInfo[9].replace('h.', ''),
              peers = iguanaGetInfo[16].split('/');

          coinsInfo[index].connection = true;

          // iguana
          if (response.status.indexOf('.RT0 ') > -1) {
            isRT = false;
            coinsInfo[index].RT = false;
            console.log('RT is not ready yet!');
          } else {
            isRT = true;
            coinsInfo[index].RT = true;
          }

          // disable coin in iguna mode
          if (conf.iguanaCurl === 'disabled') coinsInfo[index].iguana = false;

          console.log('Connections: ' + peers[0].replace('peers.', ''));
          console.log('Blocks: ' + currentHeight);
          console.log('Bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' + totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced)');

          if (isDev && showSyncDebug)
            if ($('#debug-sync-info').html().indexOf('coin: ' + index) < 0)
              $('#debug-sync-info').append('coin: ' + index + ', con ' + peers[0].replace('peers.', '') + ', bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' + totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced), RT: ' + (isRT ? 'yes' : 'no') + '<br/>');
        }
      },
      error: function(response) {
        apiProto.prototype.errorHandler(response, index);

        if (response.statusText === 'error' && !isIguana) console.log('is proxy server running?');
        else if (!response.statusCode) console.log('server is busy, check back later');
        if (response.responseText && response.responseText.indexOf('Verifying blocks...') > -1) console.log(index + ' is verifying blocks...');

        if (response.responseText) console.log('coind response: ' + response.responseText);

        /*if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) console.log('no coin is detected, at least one daemon must be running!');
        _index++;*/
      }
    }).done(function() {
      /*if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) console.log('no coin is detected, at least one daemon must be running!');
      _index++;*/
    });
  });

  // check if iguana or coind quit
  var totalCoinsRunning = 0;

  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) totalCoinsRunning++;
  }
  if (totalCoinsRunning === 0 && helperProto.prototype.getCurrentPage() !== 'index') {
    $('#temp-out-of-sync').html('Something went wrong. Please login again.');
    $('#temp-out-of-sync').removeClass('hidden');

    setTimeout(function() {
      helperProto.prototype.logout();
    }, 1000);
  }

  // out of sync message
  var outOfSyncCoinsList = '';
  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    if (coinsInfo[index].RT === false) outOfSyncCoinsList += index.toUpperCase() + ', ';
  });
  if (outOfSyncCoinsList[outOfSyncCoinsList.length - 1] === ' ') {
    outOfSyncCoinsList = outOfSyncCoinsList.replace(/, $/, '');;
  }
  if (!outOfSyncCoinsList.length) {
    $('#temp-out-of-sync').addClass('hidden');
  } else {
    $('#temp-out-of-sync').html(outOfSyncCoinsList + ' is out of sync. Information about balances, transactions and send/receive functions is limited.');
    $('#temp-out-of-sync').removeClass('hidden');
  }

  return result;
}

// check if iguana is running
apiProto.prototype.testConnection = function() {
  var result = false;

  // test if iguana is running
  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort;
  $.ajax({
    url: defaultIguanaServerUrl + '/api/iguana/getconnectioncount',
    cache: false,
    dataType: 'text',
    async: false,
    type: 'GET',
    timeout: '500',
    success: function (response) {
      // iguana env
      apiProto.prototype.errorHandler(response);
      console.log('iguana is detected');
      isIguana = true;
      apiProto.prototype.testCoinPorts();
    },
    error: function (response) {
      // non-iguana env
      apiProto.prototype.errorHandler(response);
      console.log('running non-iguana env');
      apiProto.prototype.testCoinPorts();
    }
  });

  portsTested = true;
}

apiProto.prototype.walletLogin = function(passphrase, timeout, coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletpassphrase', null, coin),
      defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort + '/api/bitcoinrpc/walletpassphrase',
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletpassphrase', '\"' + passphrase + '\", ' + timeout),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: isIguana ? defaultIguanaServerUrl : fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    success: function(response) {
      console.log(response);
      result = true;
    },
    error: function(response) {
      if (response.responseText) {
        if (response.responseText.indexOf('Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.') > -1) result = true;
        if (response.responseText.indexOf('Error: The wallet passphrase entered was incorrect') > -1) result = -14;
        if (response.responseText.indexOf('Error: running with an unencrypted wallet, but walletpassphrase was called') > -1) result = -15;
        console.log(response.responseText);
      } else {
        console.log(response.error);
      }
    }
  });

  return result;
}

apiProto.prototype.walletEncrypt = function(passphrase, coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('encryptwallet', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('encryptwallet', '\"' + passphrase + '\"'),
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
      if (response.responseText) {
        if (response.responseText.indexOf(':-15') > -1) result = -15;
        console.log(response.responseText);
      } else {
        console.log(response);
      }
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);
    console.log(_response);

    if (_response.result) {
      // non-iguana
      if (_response.result) result = _response.result;
      else result = false;
    } else {
      // iguana
      var response = $.parseJSON(_response);

      if (response.error) {
        // do something
        console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.result === 'success') result = response;
        else result = false;
      }
    }
  });

  return result;
}

apiProto.prototype.listTransactions = function(account, coin) {
  var result = false;

  // dev account lookup override
  if (coinAccountsDev && !isIguana)
    if (coinAccountsDev.coind[coin])
      account = coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('listtransactions', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('listtransactions', '\"' + account + '\", 19'); // last 20 tx
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
      console.log(_response);

      if (_response.result) {
        // non-iguana
        if (_response.result.length) result = _response.result;
        else result = false;
      } else {
        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          console.log('error: ' + response.error);
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
        console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.txid) result = response;
        else result = false;
      }
    }
  });

  return result;
}

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
          console.log('add enableaccounts=1 and staking=0 in btcd conf file');
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response, coin) !== 10) {
      if (_response.result > -1 || Number(_response) === 0) {
        // non-iguana
        result = _response.result || _response;
      } else {
        console.log(_response);

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

apiProto.prototype.walletLock = function(coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletlock', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletlock'),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
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
      console.log(_response);

      // iguana
      var response = typeof _response === 'object' ? _response : $.parseJSON(_response);

      if (response.error) {
        // do something
        console.log('error: ' + response.error);
        result = false;
      } else {
        if (response) result = response;
        else result = false;
      }
    }
  });

  return result;
}

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

apiProto.prototype.addCoin = function(coin) {
  var result = false;

  $.ajax({
    url: apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(true).server.port,
    cache: false,
    dataType: 'json',
    type: 'POST',
    data: apiProto.prototype.getConf().coins[coin].iguanaCurl,
    async: false
  })
  .done(function(response) {
    console.log(response)

    if (response.error) {
      // do something
      console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'coin added' || response.result === 'coin already there') result = response;
      else result = false;
    }
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
        console.log('error retrieving current block height from ' + apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource);
        result = false;
      }
    });
  else
    result = 'NA';

  return result;
}

apiProto.prototype.getIguanaRate = function(quote) {
  var result = false,
      quoteComponents = quote.split('/');

  $.ajax({
    url: apiProto.prototype.getServerUrl(true) + apiProto.prototype.getConf().apiRoutes.iguana.rate + '?base=' + quoteComponents[0] + '&rel=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false
  })
  .done(function(_response) {
    var response = $.parseJSON(_response);

    if (response.error) {
      // do something
      console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'success') result = response.quote;
      else result = false;
    }
  });

  return result;
}

// get a quote form an external source
// cryptonator is officially closed it's gates, no more cors
// keep an eye on, may be they'll change their mind
apiProto.prototype.getExternalRate = function(quote) {
  var result = false,
      firstSourceFailed = false,
      quoteComponents = quote.split('/');

  quote = quote.toLowerCase().replace('/', '-');
  $.ajax({
    url: 'https://min-api.cryptocompare.com/data/price?fsym=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false,
    success: function(_response) {
      var response = $.parseJSON(_response);

      if (response && response[quoteComponents[1]]) {
        result = response[quoteComponents[1]];
        console.log('rates source https://min-api.cryptocompare.com/data/price?fsym=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1]);
      } else {
        result = false;
      }
    },
    error: function(response) {
      console.log('falling back to ext service #2');
      firstSourceFailed = true;
    }
  });

  // ext. rate fallback
  if (firstSourceFailed)
    $.ajax({
      // cryptocoincharts doesn't have direct conversion altcoin -> currency
      // needs 2 requests at a time, one to get btc -> currency rate, another to get btc -> altcoin rate
      url: 'http://api.cryptocoincharts.info/tradingPair/btc_' + quoteComponents[1].toLowerCase(),
      cache: false,
      dataType: 'text',
      async: false,
      success: function(_response) {
        var response = $.parseJSON(_response);

        if (response.price) {
          btcToCurrency = response.price;

          // get btc -> altcoin rate
          $.ajax({
            url: 'https://poloniex.com/public?command=returnTicker',
            cache: false,
            dataType: 'text',
            async: false,
            success: function(_response) {
              var response = $.parseJSON(_response);

              if (response['BTC_' + quoteComponents[0].toUpperCase()]) {
                result = btcToCurrency * response['BTC_' + quoteComponents[0].toUpperCase()].last;
                console.log('rates source http://api.cryptocoincharts.info and https://poloniex.com');
              } else {
                result = false;
              }
            },
            error: function(response) {
              console.log('both services are failed to respond');
            }
          });
        } else {
          result = false;
        }
      },
      error: function(response) {
        console.log('both services failed to respond');
      }
    });

  return result;
}

//apiProto.prototype.testConnection(); // run this everytime a page is (re)loaded