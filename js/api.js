/*!
 * Iguana api config
 *
 */
//'use strict';

var apiProto = function() {};

var activeCoin,
    portsTested = false,
    isIguana = false,
    isRT = false,
    isProxy = true,
    iguanaNullReturnCount = 0,
    coinsInfo = new Array; // cointains coin related info

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

/*!
 * Iguana api/connection-check
 *
 */

// check if iguana is running
apiProto.prototype.testConnection = function(cb) {
  helper = new createHelpers();

  var result = false;
      setPortPollResponseDS = localstorage.getVal('iguana-port-poll'),
      timeDiff = setPortPollResponseDS ? Math.floor(helper.getTimeDiffBetweenNowAndDate(setPortPollResponseDS.updatedAt)) : 0;

  // force port poll update if no coin is detected
  // use case: gui is launched ahead of iguana or coind
  helper.getPortPollResponse();

  var index = 0;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      index++;
    }
  }
  if (index === 0 && dev.showConsoleMessages && dev.isDev) console.log('force port poll');

  if (timeDiff >= helper.portPollUpdateTimeout || timeDiff === 0 || index === 0 || helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
    // test if iguana is running
    var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort;
    $.ajax({
      url: defaultIguanaServerUrl + '/api/iguana/getconnectioncount',
      cache: false,
      dataType: 'text',
      async: true,
      type: 'GET',
      timeout: 500,
      success: function (response) {
        // iguana env
        isIguana = true;

        if (dev.isDev && dev.sessions) { // dev only
          for (var key in dev.sessions) {
            if (navigator.userAgent.indexOf(key) > -1) isIguana = dev.sessions[key];
          }
        }
        if (dev.showConsoleMessages && dev.isDev) {
          if (!isIguana) console.log('running non-iguana env');
          else console.log('running iguana env');
        }
        apiProto.prototype.errorHandler(response);
        apiProto.prototype.testCoinPorts(cb);
      },
      error: function (response) {
        // non-iguana env
        isIguana = false;

        if (dev.isDev && dev.sessions) { // dev only
          for (var key in dev.sessions) {
            if (navigator.userAgent.indexOf(key) > -1) {
              isIguana = dev.sessions[key];
              if (dev.sessions[key]) $(document).ready(function() { setTimeout(function() { helper.prepNoDaemonModal(); }, 300); });
            }
          }
        }
        if (dev.showConsoleMessages && dev.isDev) {
          if (!isIguana) console.log('running non-iguana env');
          else console.log('running iguana env');
        }
        apiProto.prototype.errorHandler(response);
        apiProto.prototype.testCoinPorts(cb);
      }
    });
  } else {
    if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + timeDiff + ' s. ago');
    if (cb) cb.call();
  }
}

// test must be hooked to initial gui start or addcoin method
// test default p2p
apiProto.prototype.testCoinPorts = function(cb) {
  var result = false,
      _index = 0;

  if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').html('');

  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    var fullUrl = apiProto.prototype.getFullApiRoute('getinfo', conf),
        postData = apiProto.prototype.getBitcoinRPCPayloadObj('getinfo', null, index),
        postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(conf);

    if (!coinsInfo[index]) coinsInfo[index] = [];
    coinsInfo[index].connection = false;
    coinsInfo[index].RT = false;

    $.ajax({
      url: fullUrl,
      cache: false,
      async: true,
      dataType: 'json',
      type: 'POST',
      data: postData,
      headers: postAuthHeaders,
      //timeout: isIguana ? 500 : 10000,
      success: function(response) {
        apiProto.prototype.errorHandler(response, index);

        if (dev.showConsoleMessages && dev.isDev) console.log('p2p test ' + index);
        if (dev.showConsoleMessages && dev.isDev) console.log(response);

        if (response.error === 'coin is busy processing') {
          coinsInfo[index].connection = true;
          coinsInfo[index].RT = false;
        }

        if (response.result && response.result.relayfee) {
          coinsInfo[index].relayFee = response.result.relayfee;
        }

        if (response.result && response.result.walletversion || response.result && response.result.difficulty || response.result === 'success') {
          if (dev.showConsoleMessages && dev.isDev) console.log('portp2p con test passed');
          if (dev.showConsoleMessages && dev.isDev) console.log(index + ' daemon is detected');
          coinsInfo[index].connection = true;

          // non-iguana
          // sync info
          if (!isIguana) {
            var networkCurrentHeight = 0, //apiProto.prototype.getCoinCurrentHeight(index); temp disabled
                coindCheckRTResponse = apiProto.prototype.coindCheckRT(index),
                syncPercentage = (response.result.blocks * 100 / networkCurrentHeight).toFixed(2);

            if (dev.showConsoleMessages && dev.isDev) console.log('Connections: ' + response.result.connections);
            if (dev.showConsoleMessages && dev.isDev) console.log('Blocks: ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced)');

            if (response.result.blocks === networkCurrentHeight || coindCheckRTResponse) {
              isRT = true;
              coinsInfo[index].RT = true;
            } else {
              isRT = false;
              coinsInfo[index].RT = false;
              if (dev.showConsoleMessages && dev.isDev) console.log('RT is not ready yet!');
            }

            if (dev.isDev && dev.showSyncDebug) {
              if ($('#debug-sync-info').html().indexOf('coin: ' + index + ', ') < 0)
                $('#debug-sync-info').append('coin: ' + index + ', ' +
                                             'con ' + response.result.connections + ', ' +
                                             'blocks ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced), ' +
                                             'RT: ' + (isRT ? 'yes' : 'no') + '<br/>');
            }
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
            if (dev.showConsoleMessages && dev.isDev) console.log('RT is not ready yet!');
          } else {
            isRT = true;
            coinsInfo[index].RT = true;
          }

          // disable coin in iguna mode
          if (iguanaAddCoinParams[index] && iguanaAddCoinParams[index] === 'disabled') coinsInfo[index].iguana = false;

          if (dev.showConsoleMessages && dev.isDev) console.log('Connections: ' + peers[0].replace('peers.', ''));
          if (dev.showConsoleMessages && dev.isDev) console.log('Blocks: ' + currentHeight);
          if (dev.showConsoleMessages && dev.isDev) console.log('Bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' + totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced)');

          if (dev.isDev && dev.showSyncDebug) {
            if ($('#debug-sync-info').html().indexOf('coin: ' + index + ', ') < 0)
              $('#debug-sync-info').append('coin: ' + index + ', ' +
                                           'con ' + peers[0].replace('peers.', '') + ', ' +
                                           'bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' + totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced), ' +
                                           'RT: ' + (isRT ? 'yes' : 'no') + '<br/>');
          }
        }

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) {
          helper.setPortPollResponse();
          helper.checkIfIguanaOrCoindIsPresent();
        }

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + _index);

          apiProto.prototype.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug) // debug info
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            setInterval(function() {
              if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
              $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            }, 1000);

          cb.call();
        }
        _index++;
      },
      error: function(response) {
        apiProto.prototype.errorHandler(response, index);

        if (response.statusText === 'error' && !isIguana)
          isProxy = false;
          if (dev.showConsoleMessages && dev.isDev && response.responseText && response.responseText.indexOf('Bad Gateway') === -1) console.log('is proxy server running?');
        else if (!response.statusCode)
          if (dev.showConsoleMessages && dev.isDev) console.log('server is busy, check back later');

        if (response.responseText && response.responseText.indexOf('Verifying blocks...') > -1)
          if (dev.showConsoleMessages && dev.isDev) console.log(index + ' is verifying blocks...');
        if (response.responseText)
          if (dev.showConsoleMessages && dev.isDev) console.log('coind response: ' + response.responseText);

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) {
          helper.setPortPollResponse();
          helper.checkIfIguanaOrCoindIsPresent();
        }

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + _index);

          apiProto.prototype.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug) // debug info
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            setInterval(function() {
              if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
              $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            }, 1000);

          cb.call();
        }
        _index++;
      }
    });
  });

  return result;
}

apiProto.prototype.checkBackEndConnectionStatus = function() {
  // check if iguana or coind quit
  var totalCoinsRunning = 0,
      tempOutOfSync = $('#temp-out-of-sync'),
      hiddenClassName = 'hidden';

  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) totalCoinsRunning++;
  }

  if (totalCoinsRunning === 0 && helper.getCurrentPage() !== 'login') {
    tempOutOfSync.html('Something went wrong. Please login again.');
    tempOutOfSync.removeClass('hidden');

    /*setTimeout(function() {
      helper.logout();
    }, 1000);*/
  }

  // out of sync message
  var outOfSyncCoinsList = '';
  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    if ((coinsInfo[index].RT === false && coinsInfo[index].connection === true && isIguana && localstorage.getVal('iguana-' + index + '-passphrase')) ||
        (coinsInfo[index].RT === false && !isIguana && localstorage.getVal('iguana-' + index + '-passphrase') && localstorage.getVal('iguana-' + index + '-passphrase').logged === 'yes'))
      outOfSyncCoinsList += index.toUpperCase() + ', ';
  });
  outOfSyncCoinsList = helper.trimComma(outOfSyncCoinsList);
  if (!outOfSyncCoinsList.length) {
    tempOutOfSync.addClass(hiddenClassName);
  } else {
    tempOutOfSync.html(outOfSyncCoinsList + (outOfSyncCoinsList.indexOf(',') > -1 ? ' are ' : ' is ') + 'out of sync. Information about balances, transactions and send/receive functions is limited.');
    tempOutOfSync.removeClass(hiddenClassName);
  }
}

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

/*!
 * Iguana api/handlers
 *
 */

apiProto.prototype.errorHandler = function(response, index) {
  if (response.error === 'need to unlock wallet') {
    if (helper.getCurrentPage() !== 'login')
      (function() {
        helper.prepMessageModal('We\'re sorry but something went wrong while logging you in. Please try again. Redirecting...', 'red', true);
        setTimeout(function() {
          helper.logout();
        }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
        clearInterval(dashboardUpdateTimer);
      })();

    return 10;
  }

  if (response.error === 'iguana jsonstr expired') {
    if (dev.showConsoleMessages && dev.isDev) console.log('server is busy');

    return 10;
  }

  if (response.error === 'coin is busy processing') {
    if (!coinsInfo[index]) coinsInfo[index] = [];
    coinsInfo[index].connection = true;

    if ($('#debug-sync-info') && index !== undefined && dev.isDev && dev.showSyncDebug) {
      if ($('#debug-sync-info').html().indexOf('coin ' + index) === -1 && dev.isDev && dev.showSyncDebug)
        $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');
    }

    if (dev.showConsoleMessages && dev.isDev) console.log('server is busy');

    return 10;
  }

  if (response.error === 'null return from iguana_bitcoinRPC') {
    if (dev.showConsoleMessages && dev.isDev) console.log('iguana crashed? attempts: ' + iguanaNullReturnCount + ' of ' + settings.iguanaNullReturnCountThreshold + ' max');
    iguanaNullReturnCount++;

    if (iguanaNullReturnCount > settings.iguanaNullReturnCountThreshold) {
      (function() {
        helper.prepMessageModal('We\'re sorry but it seems that Iguana has crashed. Please login again. Redirecting...', 'red', true);
        setTimeout(function() {
          helper.logout();
        }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
        clearInterval(dashboardUpdateTimer);
      })();
    }

    return 10;
  }

  if (response.responseText && response.responseText.indexOf(':-13') > -1) {
    return -13;
  }
}

/*!
 * Iguana api/iguana-coin
 * coin methods
 *
 */

apiProto.prototype.addCoin = function(coin, cb) {
  var result = false;

  $.ajax({
    url: apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(true).server.port,
    cache: false,
    dataType: 'json',
    type: 'POST',
    data: iguanaAddCoinParams[coin],
    async: cb ? true : false
  })
  .done(function(response) {
    if (dev.showConsoleMessages && dev.isDev) console.log(response);

    if (response.error) {
      // do something
      if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'coin added' || response.result === 'coin already there') result = response;
      else result = false;
    }

    if (cb) cb.call(this, result.result ? result.result : result, coin);
  });

  return result;
}

/*!
 * Iguana api/rates
 *
 */

apiProto.prototype.getIguanaRate = function(quote) {
  var result = false,
      quoteComponents = quote.split('/');

  $.ajax({
    url: apiProto.prototype.getServerUrl(true) + '/iguana/addcoin?base=' + quoteComponents[0] + '&rel=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false
  })
  .done(function(_response) {
    var response = $.parseJSON(_response);

    if (response.error) {
      // do something
      if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'success') result = response.quote;
      else result = false;
    }
  });

  return result;
}

// get a quote form an external source
apiProto.prototype.getExternalRate = function(quote, cb) {
  var result = false,
      firstSourceFailed = false,
      quoteComponents = quote.split('/');

  // 1 on 1 rate, https://min-api.cryptocompare.com/data/price?fsym=
  //https://min-api.cryptocompare.com/data/pricemulti?fsyms=LTC,BTC,UNO&tsyms=USD
  quote = quote.toLowerCase().replace('/', '-');
  $.ajax({
    url: 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: cb ? true : false,
    success: function(_response) {
      var response = $.parseJSON(_response);

      if (response && Object.keys(response).length) {
      //if (response && response[quoteComponents[1]]) {
        result = response; //response[quoteComponents[1]];
        if (dev.showConsoleMessages && dev.isDev) console.log('rates source https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1]);
      } else {
        result = false;
      }

      if (cb) cb.call(this, quoteComponents[0], result);
    },
    error: function(response) {
      console.log('falling back to ext service #2');
      firstSourceFailed = true;
    }
  });

  // TODO: rewrite fallback
  //       nested async(?)

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
                if (dev.showConsoleMessages && dev.isDev) console.log('rates source http://api.cryptocoincharts.info and https://poloniex.com');
              } else {
                result = false;
              }
            },
            error: function(response) {
              if (dev.showConsoleMessages && dev.isDev) console.log('both services are failed to respond');
            }
          });
        } else {
          result = false;
        }
      },
      error: function(response) {
        if (dev.showConsoleMessages && dev.isDev) console.log('both services failed to respond');
      }
    });

  return result;
}

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

/*!
 * Iguana api/send-coin
 *
 */

// TODO: merge wallet unlock/lock into sendtoaddress
//       prevent consequent send tx
apiProto.prototype.sendToAddress = function(coin, sendInfo, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('sendtoaddress', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('sendtoaddress', '\"' + sendInfo.address + '\", ' + sendInfo.amount + ', \"' + sendInfo.note + '\"', coin);
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);

      if (apiProto.prototype.errorHandler(response, coin) === -13)
        if (dev.showConsoleMessages && dev.isDev) console.log('unlock the wallet first');

      if (cb) cb.call(this, false);
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
        if (!_response.error) var response = $.parseJSON(_response);
        else response = _response;

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

    if (cb) cb.call(this, result);
  });

  return result;
}

apiProto.prototype.setTxFee = function(coin, fee, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('settxfee', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('settxfee', '\"' + fee + '\"', coin);
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);

      if (cb) cb.call(this, false);
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

    if (cb) cb.call(this, result);
  });

  return result;
}

/*!
 * Iguana api/server-status-check
 *
 */

apiProto.prototype.coindCheckRT = function(coin, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('getblocktemplate', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getblocktemplate'),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      if (response.responseText && response.responseText.indexOf(':-10') === -1) result = true;
      else result = false;

      if (cb) cb.call(this, result);
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);

    if (_response.result.bits) result = true;
    else result = false;

    if (cb) cb.call(this, result);
  });

  return result;
}

/* external block explorer website */
apiProto.prototype.getCoinCurrentHeight = function(coin, cb) {
  var result = false;

  if (apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource !== 'disabled')
    $.ajax({
      url: apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource,
      cache: false,
      dataType: 'text',
      async: cb ? true : false
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

        if (cb) cb.call(this, result);
      } else {
        if (dev.showConsoleMessages && dev.isDev) console.log('error retrieving current block height from ' + apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource);
        result = false;

        if (cb) cb.call(this, result);
      }
    });
  else
    result = 'NA';
    if (cb) cb.call(this, result);

  return result;
}

/*!
 * Iguana api/transactions
 *
 */

apiProto.prototype.listTransactions = function(account, coin, cb, update) {
  var result = false;

  // dev account lookup override
  if (dev.coinAccountsDev && !isIguana)
    if (dev.coinAccountsDev.coind[coin])
      account = dev.coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('listtransactions', null, coin);
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('listtransactions', '\"' + account + '\", ' + settings.defaultTransactionsCount, coin); // last N tx
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response, coin);

      if (cb) cb.call(this, false, update);
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

    if (cb) cb.call(this, result, update);
  });

  return result;
}

/* not needed atm
apiProto.prototype.getTransaction = function(txid, coin) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('gettransaction', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('gettransaction', '\"' + txid + '\"', coin),
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
*/

/*!
 * Iguana api/wallet-auth
 *
 */

apiProto.prototype.walletLogin = function(passphrase, timeout, coin, cb) {
  if (!isIguana) timeout = settings.defaultWalletUnlockPeriod;

  if (!timeout) timeout = isIguana ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind;
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletpassphrase', null, coin),
      defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort + '/api/bitcoinrpc/walletpassphrase',
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletpassphrase', '\"' + passphrase + '\", ' + timeout, coin),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

      console.log(postData);

  $.ajax({
    url: isIguana ? defaultIguanaServerUrl : fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    success: function(response) {
      if (dev.showConsoleMessages && dev.isDev) console.log(response);
      result = true;
      if (cb) cb.call(this, result, coin);
    },
    error: function(response) {
      console.log(response);
      if (response.responseText) {
        if (response.responseText.indexOf('Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.') > -1) result = true;
        if (response.responseText.indexOf('Error: The wallet passphrase entered was incorrect') > -1 || response.responseText.indexOf('"code":-1') > -1) result = -14;
        if (response.responseText.indexOf('Error: running with an unencrypted wallet, but walletpassphrase was called') > -1) result = -15;
        // if (dev.showConsoleMessages && dev.isDev) console.log(response.responseText);
      } else {
        if (dev.showConsoleMessages && dev.isDev) console.log(response.error);
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
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('encryptwallet', '\"' + passphrase + '\"', coin),
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
        if (dev.showConsoleMessages && dev.isDev) console.log(response.responseText);
      } else {
        if (dev.showConsoleMessages && dev.isDev) console.log(response);
      }
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response, coin);
    if (dev.showConsoleMessages && dev.isDev) console.log(_response);

    if (_response.result) {
      // non-iguana
      if (_response.result) result = _response.result;
      else result = false;
    } else {
      // iguana
      var response = $.parseJSON(_response);

      if (response.error) {
        // do something
        if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.result === 'success') result = response;
        else result = false;
      }
    }
  });

  return result;
}

/*
  sync - iguana
  async - coind
*/
apiProto.prototype.walletLock = function(coin, cb) {
  var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletlock', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletlock', null, coin),
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
      if (dev.showConsoleMessages && dev.isDev) console.log(_response);

      // iguana
      var response = typeof _response === 'object' ? _response : $.parseJSON(_response);

      if (response.error) {
        // do something
        if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
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

apiProto.prototype.getBalance = function(account, coin, cb) {
  var result = false;

  // dev account lookup override
  if (dev.coinAccountsDev && !isIguana)
    if (dev.coinAccountsDev.coind[coin])
      account = dev.coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('getbalance', null, coin),
      // avoid using account names in bitcoindarkd
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getbalance', coin === 'btcd' && !isIguana ? null : '\"' + account + '\"', coin),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: cb ? true : false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      if (response.responseText)
        if (response.responseText.indexOf('Accounting API is deprecated') > -1 || response.responseText.indexOf('If you want to use accounting API'))
          if (dev.showConsoleMessages && dev.isDev && coin === 'btcd') console.log('add enableaccounts=1 and staking=0 in btcd conf file');
      if (cb) cb.call(this, false, coin);
    },
    success: function(_response) {
      if (apiProto.prototype.errorHandler(_response, coin) !== 10) {
        if (_response.result > -1 || Number(_response) === 0) {
          // non-iguana
          result = _response.result > -1 ? _response.result : _response;

        } else {
          if (dev.showConsoleMessages && dev.isDev) console.log(_response);

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

      if (cb) cb.call(this, result, coin);
    }
  });

  return result;
}

var api = new apiProto();