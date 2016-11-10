'use strict';

angular.module('IguanaGUIApp.controllers')
.service('api', ['$localStorage', 'helper', '$http', '$state', '$timeout', '$interval', '$q',
  function ($localStorage, helper, $http, $state, $timeout, $interval, $q) {

  this.coinsInfo = new Array;
  this.activeCoin,
  this.portsTested = false,
  this.isIguana = false,
  this.isRT = false,
  this.isProxy = true,
  this.iguanaNullReturnCount = 0;

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
      var defaultIguanaServerUrl = this.getConf().server.protocol +
        this.getConf().server.ip +
        ':' +
        this.getConf().server.iguanaPort;

      $http.get(defaultIguanaServerUrl + '/api/iguana/getconnectioncount', {cache :false, timeout : 500})
        .then(function(response) {
          if (dev.isDev && dev.sessions) { // dev only
            for (var key in dev.sessions) {
              if (navigator.userAgent.indexOf(key) > -1) {
                this.isIguana = dev.sessions[key];
              }
            }
          }

          if (dev.showConsoleMessages && dev.isDev) {
            if (!this.isIguana) {
              console.log('running non-iguana env');
            } else {
              console.log('running iguana env');
            }
          }

          this.errorHandler(response);
          this.testCoinPorts(cb);
        }.bind(this), function(response) {
          // non-iguana env
          if (dev.isDev && dev.sessions) { // dev only
            for (var key in dev.sessions) {
              if (navigator.userAgent.indexOf(key) > -1) {
                this.isIguana = dev.sessions[key];
                if (dev.sessions[key]){
                  $timeout(function () {
                    helper.prepNoDaemonModal(); // TODO change this function to angular
                  }, 300);
                }
              }
            }
          }

          if (dev.showConsoleMessages && dev.isDev) {
            if (!this.isIguana) {
              console.log('running non-iguana env');
            } else {
              console.log('running iguana env');
            }
          }

          this.errorHandler(response);
          this.testCoinPorts(cb);
        }.bind(this));

    } else {
      if (dev.showConsoleMessages && dev.isDev) console.log('port poll done ' + timeDiff + ' s. ago');
      if (cb) cb.call();
    }
  };

  this.errorHandler = function(response, index) {
    if(response.data && response.data.error) {
      if (response.data.error.message === 'need to unlock wallet') {
        if ($state.current.name !== 'login') {
          helper.prepMessageModal('We\'re sorry but something went wrong while logging you in. Please try again. Redirecting...', 'red', true); //TODO Change Bootstrap alert
          $timeout(function() {
            helper.logout();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
          $interval.cancel(dashboardUpdateTimer);
        }

        return 10;
      } else if (response.data.error.message === 'iguana jsonstr expired') {
        if (dev.showConsoleMessages && dev.isDev){
          console.log('server is busy');
        }

        return 10;
      } else if (response.data.error.message === 'coin is busy processing') {
        if (!coinsInfo[index]) {
          coinsInfo[index] = [];
        }
        coinsInfo[index].connection = true;

        if ($('#debug-sync-info') && index !== undefined && dev.isDev && dev.showSyncDebug) {
          if ($('#debug-sync-info').html().indexOf('coin ' + index) === -1 && dev.isDev && dev.showSyncDebug){
            $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');
          }
        }

        if (dev.showConsoleMessages && dev.isDev) {
          console.log('server is busy');
        }

        return 10;
      } else if (response.data.error.message === 'null return from iguana_bitcoinRPC') {
        if (dev.showConsoleMessages && dev.isDev) console.log('iguana crashed? attempts: ' + this.iguanaNullReturnCount + ' of ' + settings.iguanaNullReturnCountThreshold + ' max');
        this.iguanaNullReturnCount++;

        if (this.iguanaNullReturnCount > settings.iguanaNullReturnCountThreshold) {
          helper.prepMessageModal('We\'re sorry but it seems that Iguana has crashed. Please login again. Redirecting...', 'red', true);//TODO Change Bootstrap alert
          $timeout(function() {
            helper.logout();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
          $interval.clear(dashboardUpdateTimer);
        }

        return 10;
      }
    }

    if (response.data && response.data instanceof String && response.data.indexOf(':-13') > -1) {
      return -13;
    }
  }

  this.testCoinPorts = function(cb) {
    function getCoins(index){
      var deferred = $q.defer();
      $http.post(fullUrl,postData,{cache: false, headers: postAuthHeaders})
        .then(function(response) {
          deferred.resolve([index, response, ++_index]);
        },function(response) {
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
        fullUrl = this.getFullApiRoute('getinfo', conf),
        postData = this.getBitcoinRPCPayloadObj('getinfo', null, index),
        postAuthHeaders = this.getBasicAuthHeaderObj(conf);

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
          if (!this.isIguana) {
            this.coindCheckRT(index, function (coindCheckRTResponse) {
              var networkCurrentHeight = 0, //apiProto.prototype.getCoinCurrentHeight(index); temp disabled
                syncPercentage = (response.data.result.blocks * 100 / networkCurrentHeight).toFixed(2);

              if (dev.showConsoleMessages && dev.isDev)
                console.log('Connections: ' + response.data.result.connections);
              if (dev.showConsoleMessages && dev.isDev)
                console.log('Blocks: ' + response.data.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced)');

              if (response.data.result.blocks === networkCurrentHeight || coindCheckRTResponse) {
                this.isRT = true;
                coinsInfo[index].RT = true;
              } else {
                this.isRT = false;
                coinsInfo[index].RT = false;
                if (dev.showConsoleMessages && dev.isDev) console.log('RT is not ready yet!');
              }

              if (dev.isDev && dev.showSyncDebug) {
                if (debugSyncInfo.html().indexOf('coin: ' + index + ', ') < 0)
                  debugSyncInfo.append(
                    'coin: ' + index + ', ' +
                    'con ' + response.data.result.connections + ', ' +
                    'blocks ' + response.data.result.blocks + '/' + networkCurrentHeight +
                    ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced), ' +
                    'RT: ' + (this.isRT ? 'yes' : 'no') + '<br/>'
                  );
              }
            }.bind(this));
          }
        }

        if (response.status && this.isIguana) {

          if (response.status !== (null || -1) &&
              response.status instanceof  'string') {
            var iguanaGetInfo = response.status.split(' '),
              totalBundles = iguanaGetInfo[20].split(':'),
              currentHeight = iguanaGetInfo[9].replace('h.', ''),
              peers = iguanaGetInfo[16].split('/');

            coinsInfo[index].connection = true;

            // iguana
            if (response.status.indexOf('.RT0 ') > -1) {
              this.isRT = false;
              coinsInfo[index].RT = false;
              if (dev.showConsoleMessages && dev.isDev) console.log('RT is not ready yet!');
            } else {
              this.isRT = true;
              coinsInfo[index].RT = true;
            }

            // disable coin in iguna mode
            if (iguanaAddCoinParams[index] && iguanaAddCoinParams[index] === 'disabled'){
              coinsInfo[index].iguana = false;
            }

            if (dev.showConsoleMessages && dev.isDev){
              console.log('Connections: ' + peers[0].replace('peers.', ''));
            }
            if (dev.showConsoleMessages && dev.isDev) {
              console.log('Blocks: ' + currentHeight);
            }
            if (dev.showConsoleMessages && dev.isDev){
              console.log('Bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' +
                  totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced)');
            }

            if (dev.isDev && dev.showSyncDebug) {
              if (debugSyncInfo.html().indexOf('coin: ' + index + ', ') < 0)
                debugSyncInfo.append('coin: ' + index + ', ' +
                    'con ' + peers[0].replace('peers.', '') + ', ' +
                    'bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' +
                    totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced), ' +
                    'RT: ' + (this.isRT ? 'yes' : 'no') + '<br/>');
            }
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

        if (response.statusText === 'error' && !this.isIguana)
          this.isProxy = false;
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
    var coins = this.getConf().coins;//TODO change this function to angular

    for (var index in coins) {
      if (
        (
          coinsInfo[index].RT === false &&
          coinsInfo[index].connection === true &&
          this.isIguana && $localStorage['iguana-' + index + '-passphrase']
        ) ||
        (
          coinsInfo[index].RT === false &&
          !this.isIguana && $localStorage['iguana-' + index + '-passphrase'] &&
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
    var fullUrl = this.getFullApiRoute('encryptwallet', null, coin),
      postData = this.getBitcoinRPCPayloadObj('encryptwallet', '\"' + passphrase + '\"', coin),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin),
      deferred = $q.defer();

    $http.post(fullUrl, postData, {cache: false, headers: postAuthHeaders})
      .then(function(response) {
        this.errorHandler(response, coin);

        if (dev.showConsoleMessages && dev.isDev) console.log(response);

        if (response.result) {
          // non-iguana
          if (_response.result) {
            deferred.resolve(response.result);
          } else {
            deferred.resolve(false);
          }
        } else {
          // iguana
          if (response.data.error) {
            // do something
            if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.data.error);

            deferred.resolve(false);
          } else {
            if (response.data.result === 'success') {
              deferred.resolve(response.data);
            } else {
              deferred.resolve(false);
            }
          }
        }
      }.bind(this), function(response) {
        if (response.status) {
          if (response.status == -15) {
            deferred.resolve(-15);
          }

          if (dev.showConsoleMessages && dev.isDev) {
            console.log(response.responseText);
          }
        } else {
          if (dev.showConsoleMessages && dev.isDev) {
            console.log(response);
          }
        }
      }.bind(this));

    return deferred.promise;
  };

  this.walletLock = function (coin, cb) {
      console.log(coin);
    var fullUrl = this.getFullApiRoute('walletlock', null, coin),
      postData = this.getBitcoinRPCPayloadObj('walletlock', null, coin),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(fullUrl, postData,{ cache: false, headers: postAuthHeaders})
      .then(function(response) {
        this.errorHandler(response, coin);

        if (response.data.result) {
          // non-iguana
        } else {
          if (dev.showConsoleMessages && dev.isDev) console.log(response);

          if (response.data.error) {
            // do something
            if (dev.showConsoleMessages && dev.isDev) {
              console.log('error: ' + response.data.error);
            }
          }
        }
        if (cb) cb.call();
      }.bind(this));
  };

  this.walletLogin = function(passphrase, timeout, coin, cb) {
    if (!this.isIguana) {
      timeout = settings.defaultWalletUnlockPeriod;
    }

    if (!timeout) {
      timeout = this.isIguana ?
        settings.defaultSessionLifetimeIguana :
        settings.defaultSessionLifetimeCoind;
    }

    var result = false,
      fullUrl = this.getFullApiRoute('walletpassphrase', null, coin),
      defaultIguanaServerUrl = this.getConf().server.protocol +
          this.getConf().server.ip +
          ':' +
          this.getConf().server.iguanaPort + '/api/bitcoinrpc/walletpassphrase',
      postData = this.getBitcoinRPCPayloadObj('walletpassphrase', '\"' + passphrase + '\", ' + timeout, coin),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(this.isIguana ? defaultIguanaServerUrl : fullUrl, postData, {headers: postAuthHeaders})
      .then(function(response) {
        if (dev.showConsoleMessages && dev.isDev) {
          console.log(response.data.result);
        }
        result = true;
        if (cb) {
          cb.call(this, response.data.result, coin);
        }
      }.bind(this), function(response) {
        console.log(response);
        //todo change response structure
        if (response.data) {
          if (response.data.error.message.indexOf('Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.') > -1) {
            result = true;
          } else if (response.data.error.message.indexOf('Error: The wallet passphrase entered was incorrect') > -1 || response.data.error.message.indexOf('"code":-1') > -1) {
            result = -14;
          } else if (response.data.error.message.indexOf('Error: running with an unencrypted wallet, but walletpassphrase was called') > -1) {
            result = -15;
          }
          // if (dev.showConsoleMessages && dev.isDev) console.log(response.responseText);
        } else {
          if (dev.showConsoleMessages && dev.isDev) {
            console.log(response);
          }
        }

        if (cb) cb.call(this, result, coin);
      }.bind(this));
  };

  this.coindCheckRT = function(coin, cb) {
    var result = false,
      fullUrl = this.getFullApiRoute('getblocktemplate', null, coin),
      postData = this.getBitcoinRPCPayloadObj('getblocktemplate'),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(fullUrl, postData, {cache: false, headers: postAuthHeaders})
      .then(function(response) {
        this.errorHandler(response, coin);

        if (response.data.result.bits) {
          result = true;
        } else {
          result = false;
        }

        if (cb) cb.call(this, result);
      }.bind(this), function(response) {
        if (response.data && response.data instanceof String && response.responseText.indexOf(':-10') === -1) {
           result = true;
        } else {
          result = false;
        }

        if (cb) cb.call(this, result);
      });
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
    if (coin && conf.coins[coin].coindPort && !this.isIguana) {
      conf.server.port = conf.coins[coin].coindPort;

      return conf;
    }

    if (this.activeCoin && !discardCoinSpecificPort) {
      conf.server.port = conf.coins[this.activeCoin].portp2p;
      if (!this.isIguana)
        if (conf.coins[this.activeCoin].coindPort) conf.server.port = conf.coins[this.activeCoin].coindPort;
    } else {
      conf.server.port = conf.server.iguanaPort;
    }

    if (coin) conf.server.port = conf.coins[coin].portp2p;

    return conf;
  };

  this.getAccountAddress = function(coin, account) {
    if (dev.coinAccountsDev && !this.isIguana) {
      if (dev.coinAccountsDev.coind[coin]) {
        account = dev.coinAccountsDev.coind[coin];
      }
    }

    var fullUrl = this.getFullApiRoute('getaccountaddress', null, coin),
      postData = this.getBitcoinRPCPayloadObj('getaccountaddress', '\"' + account + '\"', coin),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin),
      deferred = $q.defer();

    $http.post(fullUrl, postData, {cache: false, headers: postAuthHeaders})
      .then(function(response) {
          console.log(response);
          // iguana
          if (response.data.address) {
            deferred.resolve(response.data.address);
          }else {
            deferred.resolve(response.data.result); // non-iguana
          }
        }, function(response) {
          this.errorHandler(response, coin);
          if (dev.showConsoleMessages && dev.isDev) {
            console.log(response);
          }
        }.bind(this));

    return deferred.promise;
  };

  this.addCoin = function(coin, cb) {
    var result = false,
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin),
      fullUrl = this.getConf().server.protocol +
        this.getConf().server.ip + ':' +
        this.getConf(true).server.port;

    $http.post(fullUrl, iguanaAddCoinParams[coin], {headers: postAuthHeaders})
      .then(function(response) {
        if (dev.showConsoleMessages && dev.isDev) {
          console.log(response);
        }

        if (response.data.result === 'coin added' || response.data.result === 'coin already there') {
          result = response.data;
        } else {
          result = false;
        }

        if (cb) {
          cb.call(this, result.result ? result.result : result, coin);
        }
      }, function(response) {
        // do something
        if (dev.showConsoleMessages && dev.isDev) {
          console.log('error: ' + response.error);
        }
      });
  };
// todo commented code
  this.getIguanaRate = function(quote) {
    var result = false,
      quoteComponents = quote.split('/');
    var fullUrl = apiProto.prototype.getServerUrl(true) + '/iguana/addcoin?base=' + quoteComponents[0] + '&rel=' + quoteComponents[1];
    $http.get(fullUrl,'',{cache: false, async: false})
      .then(
        function(_response) {
          var response = JSON.parse(_response);
          if (response.result === 'success') {
            result = response.quote;
          } else {
            result = false;
          }
        },
        function(_response) {
          // do something
          if (dev.showConsoleMessages && dev.isDev) {
            console.log('error: ' + _response.error);
          }
          result = false;
        });

    return result;
  }

  this.getExternalRate = function(quote, cb) {
    var result = false,
      quoteComponents = quote.split('/'),
      FullUrl = 'https://min-api.cryptocompare.comggg/data/pricemulti?fsyms=' +
        quoteComponents[0] + '&tsyms=' + quoteComponents[1];

    $http.get(FullUrl, '', {cache: false})
      .then(function(response) {
        response = response.data;
        if (response && Object.keys(response).length) {
          result = response; //response[quoteComponents[1]];

          if (dev.showConsoleMessages && dev.isDev) {
            console.log('rates source https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1]);
          }
        } else {
          result = false;
        }

        if (cb) {
          cb.call(this, quoteComponents[0], result);
        }
      }, function() {
        console.log('falling back to ext service #2');

        $http.get('http://api.cryptocoincharts.info/tradingPair/btc_' + quoteComponents[1].toLowerCase(),'',{cache: false,async: false})
          .then(function(response) {
            var response = response.data;

            if (response.price) {
              var btcToCurrency = response.price;

              // get btc -> altcoin rate
              $http.get('https://poloniex.com/public?command=returnTicker', '', {cache: false})
                .then(
                  function(response){
                    var response = response.data;

                    if (response['BTC_' + quoteComponents[0].toUpperCase()]) {
                      result = btcToCurrency * response['BTC_' + quoteComponents[0].toUpperCase()].last;

                      if (dev.showConsoleMessages && dev.isDev) {
                        console.log('rates source http://api.cryptocoincharts.info and https://poloniex.com');
                      }
                    } else {
                      result = false;
                    }

                    if (cb) {
                      cb.call(this, quoteComponents[0], result);
                    }
                  }, function(response) {
                    if (dev.showConsoleMessages && dev.isDev) {
                      console.log('both services are failed to respond');
                    }
                  });

            } else {
              result = false;
            }
          }, function(response){
            if (dev.showConsoleMessages && dev.isDev) {
              console.log('both services failed to respond');
            }
          })
      });
  };

  this.getServerUrl = function(discardCoinSpecificPort) {
    return this.getConf().server.protocol +
      this.getConf().server.ip + ':' +
      this.getConf(discardCoinSpecificPort).server.port + '/api/';
  };

  this.getBasicAuthHeaderObj = function(conf, coin) {
    if (conf) {
      return this.isIguana ?
        {'Content-Type': 'application/x-www-form-urlencoded'} :
        { 'Authorization': 'Basic ' + btoa(conf.user + ':' + conf.pass) };
    } else if (this.activeCoin || coin) {
      return this.isIguana ?
        {'Content-Type': 'application/x-www-form-urlencoded'} :
        {
          'Authorization': 'Basic ' + btoa(this.getConf().coins[coin ? coin : this.activeCoin].user + ':' +
                            this.getConf().coins[coin ? coin : this.activeCoin].pass)
        };
    }

    return {};
  };

  this.getBitcoinRPCPayloadObj = function(method, params, coin) {
    if (this.isIguana) {
      return '{ ' + (coin ? ('\"coin\": \"' + coin.toUpperCase() + '\", ') : '') + '\"method\": \"' + method + '\", \"immediate\": \"1000\", \"params\": [' + (!params ? '' : params) + '] }';
    } else {
      return '{ \"agent\": \"bitcoinrpc\",' +
        '\"method\": \"' + method + '\", \"timeout\": \"2000\", \"params\": [' + (!params ? '' : params) + '] }';
    }
  };

  this.getFullApiRoute = function(method, conf, coin) {
    if (conf) {
      return this.isIguana ? (this.getConf().server.protocol +
        this.getConf().server.ip + ':' +
        conf.portp2p + '/api/bitcoinrpc/' + method) : (settings.proxy +
        this.getConf().server.ip + ':' +
        (conf.coindPort ? conf.coindPort : conf.portp2p));
    }
    else {
      return this.isIguana ? (this.getConf().server.protocol +
        this.getConf().server.ip + ':' +
        this.getConf(true).server.port /*getConf(false, coin).server.port*/ + '/api/bitcoinrpc/' + method) : (settings.proxy +
        this.getConf().server.ip + ':' +
        this.getConf(false, coin).server.port);
    }

  };

// TODO: merge wallet unlock/lock into sendtoaddress
  this.sendToAddress = function(coin, sendInfo, cb) {
    var result = false,
      fullUrl = this.getFullApiRoute('sendtoaddress', null, coin),
      postData = this.getBitcoinRPCPayloadObj('sendtoaddress', '\"' + sendInfo.address + '\", ' + sendInfo.amount + ', \"' + sendInfo.note + '\"', coin),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(fullUrl, postData, {cache: false, headers: postAuthHeaders})
      .then(function(_response) {
        debugger;
          if (this.errorHandler(_response, coin) !== 10) {
            if (dev.showConsoleMessages && dev.isDev) {
              console.log(_response);
            }

            if (_response.result) {
              // non-iguana
              if (_response.result.length) {
                result = _response.result;
              } else {
                result = false;
              }
            } else {
              // iguana
              if (!_response.error) {
                var response = JSON.parse(_response);
              }
              else {
                response = _response;
              }

              if (response.error) {
                // do something
                if (dev.showConsoleMessages && dev.isDev) {
                  console.log('error: ' + response.error);
                }
                result = false;
              } else {
                if (response.result.length) {
                  result = response.result;
                } else {
                  result = false;
                }
              }
            }
          }

          if (cb) {
            cb.call(this, result);
          }
        }.bind(this), function(response) {
          debugger;
          this.errorHandler(response, coin);

          if (this.errorHandler(response, coin) === -13) {
            if (dev.showConsoleMessages && dev.isDev) {
              console.log('unlock the wallet first');
            }
          }

          if (cb) {
            cb.call(this, false);
          }
        }.bind(this));

    return result;
  }

  this.setTxFee = function(coin, fee, cb) {
    var result = false,
      fullUrl = this.getFullApiRoute('settxfee', null, coin);
    var postData = this.getBitcoinRPCPayloadObj('settxfee', '\"' + fee + '\"', coin);
    var postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(fullUrl,postData,{cache: false,async: cb ? true : false,headers: postAuthHeaders,})
      .then(
        function(_response) {

          if (this.errorHandler(_response, coin) !== 10) {
            if (dev.showConsoleMessages && dev.isDev) {
              console.log(_response);
            }
            if (_response.result) {
              // non-iguana
              if (_response.result.length) {
                result = _response.result;
              } else {
                result = false;
              }
            } else {
              // iguana
              var response = JSON.parse(_response);

              if (response.error) {
                // do something
                if (dev.showConsoleMessages && dev.isDev) {
                  console.log('error: ' + response.error);
                }
                result = false;

              } else {
                if (response.result.length) {
                  result = response.result;
                } else {
                  result = false;
                }
              }
            }
          }

          if (cb) {
            cb.call(this, result);
          }
        }.bind(this),
        function(response) {
          this.errorHandler(response, coin);

          if (cb) {
            cb.call(this, false);
          }
        }.bind(this));
    return result;
  };

  this.getCoinCurrentHeight = function(coin, cb) {
    var result = false;

    if (this.getConf().coins[coin].currentBlockHeightExtSource !== 'disabled') {
      $http.get(this.getConf().coins[coin].currentBlockHeightExtSource,'',{cache: false, async: cb ? true : false})
        .then(
          function(response) {

            if (response.blockcount || response.info || response.height || response.data || response[coin] || response.blocks) {
              if (response.blockcount) {
                result = response.blockcount;
              }
              if (response.info) {
                result = response.info.blocks;
              }
              if (response.height) {
                result = response.height;
              }
              if (response.blocks) {
                result = response.blocks;
              }
              if (response.data) {
                result = response.data.last_block.nb;
              }
              if (response[coin]) {
                result = response[coin].height;
              }

              if (cb) {
                cb.call(this, result);
              }
            } else {
              if (dev.showConsoleMessages && dev.isDev) console.log('error retrieving current block height from ' + this.getConf().coins[coin].currentBlockHeightExtSource);
              result = false;

              if (cb) cb.call(this, result);
            }
          })
    }else {
      result = 'NA';
    }
    if (cb) {
      cb.call(this, result);
    }

    return result;
  }

  this.listTransactions = function(account, coin, cb, update) {
    var result = false;

    // dev account lookup override
    if (dev.coinAccountsDev && !this.isIguana) {
      if (dev.coinAccountsDev.coind[coin]) {
        account = dev.coinAccountsDev.coind[coin];
      }
    }

    var fullUrl = this.getFullApiRoute('listtransactions', null, coin);
    var postData = this.getBitcoinRPCPayloadObj('listtransactions', '\"' + account + '\", ' + settings.defaultTransactionsCount, coin); // last N tx
    var postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(fullUrl, postData, {cache: false, headers: postAuthHeaders})
      .then(function(response) {
        if (this.errorHandler(response, coin) !== 10) {
          if (dev.showConsoleMessages && dev.isDev) {
            console.log(response);
          }

          if (response.data.result) {
            // non-iguana
            if (response.data.result.length) {
              result = response.data.result;
            }else {
              result = false;
            }

          } else {
            // iguana
            if (response.data && response.data.error) {
              // do something
              if (dev.showConsoleMessages && dev.isDev) {
                console.log('error: ' + response.data.error);
              }
              result = false;

            } else {
              if (response.data.result.length) {
                result = response.data.result;
              }else {
                result = false;
              }
            }
          }
        }

        if (cb) {
          cb.call(this, result, update);
        }
      }.bind(this), function(response) {
        this.errorHandler(response, coin);

        if (cb) {
          cb.call(this, false, update);
        }
      }.bind(this));
  };

  this.getBalance = function(account, coin, cb) {
    var result = false;

    // dev account lookup override
    if (dev.coinAccountsDev && !this.isIguana) {
      if (dev.coinAccountsDev.coind[coin]) {
        account = dev.coinAccountsDev.coind[coin];
      }
    }

    var fullUrl = this.getFullApiRoute('getbalance', null, coin),
      // avoid using account names in bitcoindarkd
      postData = this.getBitcoinRPCPayloadObj('getbalance', coin === 'btcd' && !this.isIguana ? null : '\"' + account + '\"', coin),
      postAuthHeaders = this.getBasicAuthHeaderObj(null, coin);

    $http.post(fullUrl, postData, {cache: false, dataType: 'json', headers: postAuthHeaders})
      .then(function(response) {
        if (this.errorHandler(response, coin) !== 10) {
          if (response.data.result > -1 || Number(response) === 0) {
            // non-iguana
            result = response.data.result > -1 ? response.data.result : response;
          } else {
            if (dev.showConsoleMessages && dev.isDev) {
              console.log(response);
            }

            // iguana
            if (response.data && response.data.error) {
              // do something
              console.log('error: ' + response.data.error);
              result = false;

            } else {
              if (response) {
                result = response;
              } else {
                result = false;
              }
            }
          }
        }

        if (cb) {
          cb.call(this, result, coin);
        }
      }.bind(this), function(response) {
        if (response.data) {
          if (
            response.data.indexOf('Accounting API is deprecated') > -1 ||
            response.data.indexOf('If you want to use accounting API')
          ) {
            if (dev.showConsoleMessages && dev.isDev && coin === 'btcd') {
              console.log('add enableaccounts=1 and staking=0 in btcd conf file');
            }
          }
        }

        if (cb) {
          cb.call(this, false, coin);
        }
      }.bind(this));
  };
}]);