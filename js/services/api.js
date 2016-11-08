'use strict';

angular.module('IguanaGUIApp.controllers')
.service('Api', ['$localStorage', 'helper', '$http', '$state', '$timeout', '$interval', '$q',
  function ($localStorage, helper, $http, $state, $timeout, $interval, $q) {

  this.coinsInfo = new Array;

  this.testConnection = function (cb) {
    var setPortPollResponseDS = $localStorage['iguana-port-poll'];
    var timeDiff = setPortPollResponseDS ?
        Math.floor(helper.getTimeDiffBetweenNowAndDate(setPortPollResponseDS.updatedAt)) :
        0;
    var index = 0;

    helper.getPortPollResponse.apply({
      setPortPollResponseDS:setPortPollResponseDS
    }); // TODO change this function to angular

    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true) {
        index++;
      }
    }

    if (index === 0 && dev.showConsoleMessages && dev.isDev) {
      console.log('force port poll');
    }

    if (
      timeDiff >= helper.portPollUpdateTimeout ||
      timeDiff === 0 ||
      index === 0 ||
      $state.current.name === 'login' ||
      $state.current.name === 'signup'
    ) {
      //TODO change this function to angular
      var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol +
        this.getConf().server.ip +
        ':' +
        this.getConf().server.iguanaPort;

      $http({
        method: 'GET',
        url: defaultIguanaServerUrl + '/api/iguana/getconnectioncount',
        cache: false,
        dataType: 'text',
        async: true,
        timeout: 500
      })
      .then(
        function (response) {
        var isIguana = true;

        if (dev.isDev && dev.sessions) { // dev only
          for (var key in dev.sessions) {
            if (navigator.userAgent.indexOf(key) > -1) {
              isIguana = dev.sessions[key];
            }
          }
        }
        if (dev.showConsoleMessages && dev.isDev) {
          if (!isIguana) {
            console.log('running non-iguana env');
          } else {
            console.log('running iguana env');
          }
        }
        this.errorHandler(response);
        this.testCoinPorts(cb);

      }
      .bind(this)),
        function (response) {
        // non-iguana env
        var isIguana = false;

        if (dev.isDev && dev.sessions) { // dev only
          for (var key in dev.sessions) {
            if (navigator.userAgent.indexOf(key) > -1) {
              isIguana = dev.sessions[key];
              if (dev.sessions[key]){
                $timeout(function () {
                  helper.prepNoDaemonModal(); // TODO change this function to angular
                }, 300);
              }
            }
          }
        }

        if (dev.showConsoleMessages && dev.isDev) {
          if (!isIguana) {
            console.log('running non-iguana env');
          } else {
            console.log('running iguana env');
          }
        }

        this.errorHandler(response);
        this.testCoinPorts(cb);
      }
      .bind(this);
    } else {
      if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + timeDiff + ' s. ago');
      if (cb) cb.call();
    }
  };


  this.errorHandler = function(response, index) {
    if (response.error === 'need to unlock wallet') {
      if ($state.current.name !== 'login')
        (function() {
          helper.prepMessageModal('We\'re sorry but something went wrong while logging you in. Please try again. Redirecting...', 'red', true); //TODO Change Bootstrap alert
          $timeout(function() {
            helper.logout();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
          $interval.cancel(dashboardUpdateTimer);
        })();

      return 10;
    }

    if (response.error === 'iguana jsonstr expired') {
      if (dev.showConsoleMessages && dev.isDev){
        console.log('server is busy');
      }

      return 10;
    }

    if (response.error === 'coin is busy processing') {
      if (!coinsInfo[index]) {
        coinsInfo[index] = [];
      }
      coinsInfo[index].connection = true;

      // TODO change this function to angular
      if ($('#debug-sync-info') && index !== undefined && dev.isDev && dev.showSyncDebug) {
        if ($('#debug-sync-info').html().indexOf('coin ' + index) === -1 && dev.isDev && dev.showSyncDebug){
          $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');
        }
      }

      if (dev.showConsoleMessages && dev.isDev) {
        console.log('server is busy');
      }

      return 10;
    }

    if (response.error === 'null return from iguana_bitcoinRPC') {
      if (dev.showConsoleMessages && dev.isDev) console.log('iguana crashed? attempts: ' + iguanaNullReturnCount + ' of ' + settings.iguanaNullReturnCountThreshold + ' max');
      iguanaNullReturnCount++;

      if (iguanaNullReturnCount > settings.iguanaNullReturnCountThreshold) {
        (function() {
          helper.prepMessageModal('We\'re sorry but it seems that Iguana has crashed. Please login again. Redirecting...', 'red', true);//TODO Change Bootstrap alert
          $timeout(function() {
            helper.logout();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
          $interval.clear(dashboardUpdateTimer);
        })();
      }

      return 10;
    }

    if (response.responseText && response.responseText.indexOf(':-13') > -1) {
      return -13;
    }
  }

  this.testCoinPorts = function(cb) {
    function getCoins(index){
      var deferred = $q.defer();

      $http({
        method: 'POST',
        url: fullUrl,
        cache: false,
        dataType: 'json',
        data: postData,
        headers: postAuthHeaders
      })
        .then(function (response) {
        deferred.resolve([index, response, ++_index]);
      }).catch(function (response) {
        deferred.resolve([index, response, ++_index]);
      });

      return deferred.promise;
    }

    var result = false,
      _index = 0,
      debugSyncInfo = angular.element(document).find('#debug-sync-info');

    if (dev.isDev && dev.showSyncDebug) {
      debugSyncInfo.html(''); //ToDo change to angular
    }

    var coins = this.getConf().coins;

    for (var index in coins) {
      var conf = coins[index],
        // TODO change this function to angular
        fullUrl = apiProto.prototype.getFullApiRoute('getinfo', conf),
        postData = apiProto.prototype.getBitcoinRPCPayloadObj('getinfo', null, index),
        postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(conf);

      if (!coinsInfo[index]) {
        coinsInfo[index] = [];
      }

      coinsInfo[index].connection = false;
      coinsInfo[index].RT = false;
      getCoins(index, _index).then(function (data) {

        var index = data[0],
          response = data[1],
          _index = data[2];
        this.errorHandler(response, index);

        if (dev.showConsoleMessages && dev.isDev) console.log('p2p test ' + index);
        if (dev.showConsoleMessages && dev.isDev) console.log(response);

        if (response.data && response.data.error === 'coin is busy processing') {
          coinsInfo[index].connection = true;
          coinsInfo[index].RT = false;
        }

        if (response.data && response.data.result && response.data.result.relayfee) {
          coinsInfo[index].relayFee = response.data.result.relayfee;
        }

        if (response.data && (
          response.data.result && response.data.result.walletversion ||
          response.data.result && response.data.result.difficulty ||
          response.data.result === 'success'
        )) {
          if (dev.showConsoleMessages && dev.isDev) console.log('portp2p con test passed');
          if (dev.showConsoleMessages && dev.isDev) console.log(index + ' daemon is detected');
          coinsInfo[index].connection = true;

          // non-iguana
          // sync info
          if (!isIguana) {
            var networkCurrentHeight = 0, //apiProto.prototype.getCoinCurrentHeight(index); temp disabled
              coindCheckRTResponse = this.coindCheckRT(index),
              syncPercentage = (response.data.result.blocks * 100 / networkCurrentHeight).toFixed(2);

            if (dev.showConsoleMessages && dev.isDev)
              console.log('Connections: ' + response.data.result.connections);
            if (dev.showConsoleMessages && dev.isDev)
              console.log('Blocks: ' + response.data.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced)');

            if (response.data.result.blocks === networkCurrentHeight || coindCheckRTResponse) {
              isRT = true;
              coinsInfo[index].RT = true;
            } else {
              isRT = false;
              coinsInfo[index].RT = false;
              if (dev.showConsoleMessages && dev.isDev) console.log('RT is not ready yet!');
            }

            if (dev.isDev && dev.showSyncDebug) {
              if (debugSyncInfo.html().indexOf('coin: ' + index + ', ') < 0)
                debugSyncInfo.append('coin: ' + index + ', ' +
                  'con ' + response.data.result.connections + ', ' +
                  'blocks ' + response.data.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced), ' +
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
          if (iguanaAddCoinParams[index] && iguanaAddCoinParams[index] === 'disabled')
            coinsInfo[index].iguana = false;

          if (dev.showConsoleMessages && dev.isDev)
            console.log('Connections: ' + peers[0].replace('peers.', ''));
          if (dev.showConsoleMessages && dev.isDev)
            console.log('Blocks: ' + currentHeight);
          if (dev.showConsoleMessages && dev.isDev)
            console.log('Bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' +
                        totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced)');

          if (dev.isDev && dev.showSyncDebug) {
            if (debugSyncInfo.html().indexOf('coin: ' + index + ', ') < 0)
              debugSyncInfo.append('coin: ' + index + ', ' +
                'con ' + peers[0].replace('peers.', '') + ', ' +
                'bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' +
                 totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced), ' +
                'RT: ' + (isRT ? 'yes' : 'no') + '<br/>');
          }
        }

        if (Object.keys(this.getConf().coins).length === _index) {
          var setPortPollResponseDS = $localStorage['iguana-port-poll'];
          helper.setPortPollResponse();
          helper.checkIfIguanaOrCoindIsPresent.apply({setPortPollResponseDS: setPortPollResponseDS});
        }

        if (Object.keys(this.getConf().coins).length === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + _index);

          this.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug && debugSyncInfo.text()) // debug info
            angular.element(document.body).css({ 'padding-bottom': debugSyncInfo.outerHeight() * 1.5 });
          setInterval(function() {
            var transactionUnit = angular.element(document.querySelector('.transactions-unit'));
            if (debugSyncInfo.text()) {
              if (transactionUnit) transactionUnit.css({ 'margin-bottom': debugSyncInfo.outerHeight() * 1.5 });
              angular.element(document.body).css({ 'padding-bottom': debugSyncInfo.outerHeight() * 1.5 });
            }
          }, 1000);

          cb();
        }

      }.bind(this), function (response) {

        this.errorHandler(response, index);

        if (response.statusText === 'error' && !isIguana)
          isProxy = false;
        if (dev.showConsoleMessages && dev.isDev && response.responseText && response.responseText.indexOf('Bad Gateway') === -1) {
          console.log('is proxy server running?');
        }
        else if (!response.statusCode){
          if (dev.showConsoleMessages && dev.isDev) {
            console.log('server is busy, check back later');
          }
        }

        if (response.responseText && response.responseText.indexOf('Verifying blocks...') > -1){
          if (dev.showConsoleMessages && dev.isDev) {
            console.log(index + ' is verifying blocks...');
          }
        }

        if (response.responseText){
          if (dev.showConsoleMessages && dev.isDev) {
            console.log('coind response: ' + response.responseText);
          }
        }

        if (Object.keys(this.getConf().coins).length - 1 === _index) {
          helper.setPortPollResponse();
          helper.checkIfIguanaOrCoindIsPresent();
        }

        if (Object.keys(this.getConf().coins).length - 1 === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) {
            console.log('port poll done ' + _index);
          }

          this.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug) { // debug info
            angular.element(document.body).css({ 'padding-bottom': debugSyncInfo.outerHeight() * 1.5 });
          }

          setInterval(function() {
            //TODO change this function to angular
            var transactionUnit = angular.element(document.querySelector('.transactions-unit'));
              transactionUnit.css({ 'margin-bottom': debugSyncInfo.outerHeight() * 1.5 });
            angular.element(document.body).css({ 'padding-bottom': debugSyncInfo.outerHeight() * 1.5 });
          }, 1000);

          cb();
        }
        _index++;

      }
      .bind(this));
    }

    return result;
  };

  this.checkBackEndConnectionStatus = function() {
    var totalCoinsRunning = 0,
      tempOutOfSync = $('#temp-out-of-sync'), //TODO change to angular
      hiddenClassName = 'hidden';

    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true) totalCoinsRunning++;
    }

    if (totalCoinsRunning === 0 && $state.current.name !== 'login') {
      tempOutOfSync.html('Something went wrong. Please login again.');
      tempOutOfSync.removeClass('hidden');
    }

    // out of sync message
    var outOfSyncCoinsList = '';
    var coins = apiProto.prototype.getConf().coins;//TODO change this function to angular

    for (var index in coins) {
      if (
        (
          coinsInfo[index].RT === false &&
          coinsInfo[index].connection === true &&
          isIguana && $localStorage['iguana-' + index + '-passphrase']
        ) ||
        (
          coinsInfo[index].RT === false &&
          !isIguana && $localStorage['iguana-' + index + '-passphrase'] &&
          $localStorage['iguana-' + index + '-passphrase'].logged === 'yes'
        )
      ) {
        outOfSyncCoinsList += index.toUpperCase() + ', ';
      }
    }

    outOfSyncCoinsList = helper.trimComma(outOfSyncCoinsList);

    if (!outOfSyncCoinsList.length) {
      tempOutOfSync.addClass(hiddenClassName);
    } else {
      tempOutOfSync.html(outOfSyncCoinsList + (outOfSyncCoinsList.indexOf(',') > -1 ? ' are ' : ' is ') + 'out of sync. Information about balances, transactions and send/receive functions is limited.');
      tempOutOfSync.removeClass(hiddenClassName);
    }
  };

  this.walletEncrypt = function(passphrase, coin) {
    var result = false,
      //TODO change this function to angular
      fullUrl = apiProto.prototype.getFullApiRoute('encryptwallet', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('encryptwallet', '\"' + passphrase + '\"', coin),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

    $http({
      method: 'POST',
      url: fullUrl,
      cache: false,
      async: false,
      dataType: 'json',
      data: postData,
      headers: postAuthHeaders
    })
    .then(function successCallback(_response) {
      apiProto.prototype.errorHandler(_response, coin);
      if (dev.showConsoleMessages && dev.isDev) console.log(_response);

      if (_response.result) {
        // non-iguana
        if (_response.result) result = _response.result;
        else result = false;
      } else {
        // iguana
        var response = JSON.parse(_response);

        if (response.error) {
          // do something
          if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
          result = false;
        } else {
          if (response.result === 'success') result = response;
          else result = false;
        }
      }
    }
    .bind(this), function errorCallback(response) {
      if (response.responseText) {
        if (response.responseText.indexOf(':-15') > -1) result = -15;
        if (dev.showConsoleMessages && dev.isDev) console.log(response.responseText);
      } else {
        if (dev.showConsoleMessages && dev.isDev) console.log(response);
      }
    }
    .bind(this));
  };

  this.walletLock = function (coin, cb) {
      console.log(coin);
    var fullUrl = apiProto.prototype.getFullApiRoute('walletlock', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletlock', null, coin),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

    $http({
      url: fullUrl,
      cache: false,
      dataType: 'json',
      type: 'POST',
      data: postData,
      headers: postAuthHeaders
    })
      .then(function(_response) {
        this.errorHandler(_response, coin);

        if (_response.result) {
          // non-iguana
        } else {
          if (dev.showConsoleMessages && dev.isDev) console.log(_response);

          // iguana
          var response = typeof _response === 'object' ? _response : JSON.parse(_response);

          if (response.error) {
            // do something
            if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
          }

        }

        if (cb) cb.call();
      }.bind(this));
  };

  this.walletLogin = function(passphrase, timeout, coin, cb) {

    if (!isIguana) {
      timeout = settings.defaultWalletUnlockPeriod;
    }

    if (!timeout) {
      timeout = isIguana ?
        settings.defaultSessionLifetimeIguana :
        settings.defaultSessionLifetimeCoind;
    }

    var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('walletpassphrase', null, coin),
      defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort + '/api/bitcoinrpc/walletpassphrase',
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletpassphrase', '\"' + passphrase + '\", ' + timeout, coin),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);
      postAuthHeaders['Content-Type'] = 'application/json;charset=UTF-8';
    console.log(postData);
    $http.post(isIguana ? defaultIguanaServerUrl : fullUrl,postData,{headers:postAuthHeaders})
      .then(function(response) {
        if (dev.showConsoleMessages && dev.isDev) console.log(response.data.result);
        result = true;
        if (cb) cb.call(this, response.data.result, coin);
      }.bind(this), function(response) {
        console.log(response);
        //todo change response structure
        if (response.data) {
          if (response.data.error.message.indexOf('Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.') > -1) result = true;
          if (response.data.error.message.indexOf('Error: The wallet passphrase entered was incorrect') > -1 || response.data.error.message.indexOf('"code":-1') > -1) result = -14;
          if (response.data.error.message.indexOf('Error: running with an unencrypted wallet, but walletpassphrase was called') > -1) result = -15;
          // if (dev.showConsoleMessages && dev.isDev) console.log(response.responseText);
        } else {
          if (dev.showConsoleMessages && dev.isDev) console.log(response.data.error);
        }
        if (cb) cb.call(this, result, coin);
      }.bind(this));
  };

  this.coindCheckRT = function(coin, cb) {
    var result = false,
      fullUrl = apiProto.prototype.getFullApiRoute('getblocktemplate', null, coin),
      postData = apiProto.prototype.getBitcoinRPCPayloadObj('getblocktemplate'),
      postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

    $http({
      url: fullUrl,
      cache: false,
      async: cb ? true : false,
      dataType: 'json',
      type: 'POST',
      data: postData,
      headers: postAuthHeaders,

    })
      .then(function(_response) {
        apiProto.prototype.errorHandler(_response, coin);

        if (_response.result.bits) result = true;
        else result = false;

        if (cb) cb.call(this, result);
      }, function(response) {
      if (response.responseText && response.responseText.indexOf(':-10') === -1) result = true;
      else result = false;

      if (cb) cb.call(this, result);
    });

    return result;
  };

  this.getConf = function(discardCoinSpecificPort, coin) {
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
  };
}]);