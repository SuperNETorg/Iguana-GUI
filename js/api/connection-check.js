/*!
 * Iguana api/connection-check
 *
 */

// check if iguana is running
apiProto.prototype.testConnection = function(cb) {
  var result = false;
      setPortPollResponseDS = localStorageProto.prototype.getVal('iguana-port-poll'),
      timeDiff = setPortPollResponseDS ? Math.floor(helperProto.prototype.getTimeDiffBetweenNowAndDate(setPortPollResponseDS.updatedAt)) : 0;

  // force port poll update if no coin is detected
  // use case: gui is launched ahead of iguana or coind
  helperProto.prototype.getPortPollResponse();

  var index = 0;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      index++;
    }
  }
  if (index === 0 && dev.showConsoleMessages && dev.isDev) console.log('force port poll');

  if (timeDiff >= portPollUpdateTimeout || timeDiff === 0 || index === 0 || helperProto.prototype.getCurrentPage() === 'index') {
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
        if (dev.showConsoleMessages && dev.isDev) console.log('iguana is detected');
        apiProto.prototype.errorHandler(response);
        apiProto.prototype.testCoinPorts(cb);
      },
      error: function (response) {
        // non-iguana env
        isIguana = false;
        if (dev.showConsoleMessages && dev.isDev) console.log('running non-iguana env');
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

    $.ajax({
      url: fullUrl,
      cache: false,
      async: true,
      dataType: 'json',
      type: 'POST',
      data: postData,
      headers: postAuthHeaders,
      timeout: isIguana ? 500 : 10000,
      success: function(response) {
        apiProto.prototype.errorHandler(response, index);
        console.log(response);

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
          if (conf.iguanaCurl === 'disabled') coinsInfo[index].iguana = false;

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
          helperProto.prototype.setPortPollResponse();
        }

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + _index);

          apiProto.prototype.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug)
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            setInterval(function() {
              if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
              $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            }, 1000);

          helperProto.prototype.checkIfIguanaOrCoindIsPresent();
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
          helperProto.prototype.setPortPollResponse();
        }

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + _index);

          apiProto.prototype.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug)
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            setInterval(function() {
              if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
              $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            }, 1000);

          helperProto.prototype.checkIfIguanaOrCoindIsPresent();
          cb.call();
        }
        _index++;
      }
    })
  });

  return result;
}

apiProto.prototype.checkBackEndConnectionStatus = function() {
  // check if iguana or coind quit
  var totalCoinsRunning = 0,
      localStorage = new localStorageProto();

  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) totalCoinsRunning++;
  }

  if (totalCoinsRunning === 0 && helperProto.prototype.getCurrentPage() !== 'index') {
    $('#temp-out-of-sync').html('Something went wrong. Please login again.');
    $('#temp-out-of-sync').removeClass('hidden');

    /*setTimeout(function() {
      helperProto.prototype.logout();
    }, 1000);*/
  }

  // out of sync message
  var outOfSyncCoinsList = '';
  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    if ((coinsInfo[index].RT === false && coinsInfo[index].connection === true && isIguana && localStorage.getVal('iguana-' + index + '-passphrase')) ||
        (coinsInfo[index].RT === false && !isIguana && localStorage.getVal('iguana-' + index + '-passphrase') && localStorage.getVal('iguana-' + index + '-passphrase').logged === 'yes'))
      outOfSyncCoinsList += index.toUpperCase() + ', ';
  });
  if (outOfSyncCoinsList[outOfSyncCoinsList.length - 1] === ' ') {
    outOfSyncCoinsList = outOfSyncCoinsList.replace(/, $/, '');
  }
  if (!outOfSyncCoinsList.length) {
    $('#temp-out-of-sync').addClass('hidden');
  } else {
    $('#temp-out-of-sync').html(outOfSyncCoinsList + (outOfSyncCoinsList.indexOf(',') > -1 ? ' are ' : ' is ') + 'out of sync. Information about balances, transactions and send/receive functions is limited.');
    $('#temp-out-of-sync').removeClass('hidden');
  }
}