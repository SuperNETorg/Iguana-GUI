var app = angular.module('IguanaGUIApp.controllers');
app.service('api', ['$localStorage', 'helper', '$http', '$state', function ($localStorage, helper, $http, $state) {
  this.coinsInfo = new Array;

  this.testConnection = function (cb) {
    setPortPollResponseDS = $localStorage['iguana-port-poll'];
    var timeDiff = setPortPollResponseDS ?
      Math.floor(helper.getTimeDiffBetweenNowAndDate(setPortPollResponseDS.updatedAt)) :
      0;
    var index = 0;

    helper.getPortPollResponse(); //TODO change this function to angular

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
        apiProto.prototype.getConf().server.ip +
        ':' +
        apiProto.prototype.getConf().server.iguanaPort;


      $http({
        method: 'GET',
        url: defaultIguanaServerUrl + '/api/iguana/getconnectioncount',
        cache: false,
        dataType: 'text',
        async: true,
        timeout: 500
      }).then(function successCallback(response) {
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

      }.bind(this), function errorCallback(response) {
        // non-iguana env
        var isIguana = false;

        if (dev.isDev && dev.sessions) { // dev only
          for (var key in dev.sessions) {
            if (navigator.userAgent.indexOf(key) > -1) {
              isIguana = dev.sessions[key];
              if (dev.sessions[key]){
                setTimeout(function () {
                  helper.prepNoDaemonModal();//TODO change this function to angular
                }, 300);
              }
            }
          }
        }

        if (dev.showConsoleMessages && dev.isDev) {
          if (!isIguana) {
            console.log('running non-iguana env');
          }else {
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
    if (response.error === 'need to unlock wallet') {
      if ($state.current.name !== 'login')
        (function() {
          helper.prepMessageModal('We\'re sorry but something went wrong while logging you in. Please try again. Redirecting...', 'red', true); //TODO Change Bootstrap alert
          setTimeout(function() {
            helper.logout();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
          clearInterval(dashboardUpdateTimer);
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

      //TODO change this function to angular
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

  this.testCoinPorts = function(cb) {
    var result = false,
      _index = 0;

    if (dev.isDev && dev.showSyncDebug) {
      $('#debug-sync-info').html(''); //ToDo change to angular
    }

    var coins = apiProto.prototype.getConf().coins;

    for (var index in coins) {
      var conf = coins[index];
        //TODO change this function to angular
        fullUrl = apiProto.prototype.getFullApiRoute('getinfo', conf),
        postData = apiProto.prototype.getBitcoinRPCPayloadObj('getinfo', null, index),
        postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(conf);

      if (!coinsInfo[index]) {
        coinsInfo[index] = [];
      }

      coinsInfo[index].connection = false;
      coinsInfo[index].RT = false;

      $http({
        method: 'POST',
        url: fullUrl,
        cache: false,
        async: true,
        dataType: 'json',
        data: postData,
        headers: postAuthHeaders,

      }).then(function successCallback(response) {
        this.errorHandler(response, index);

        if (dev.showConsoleMessages && dev.isDev) console.log('p2p test ' + index);
        if (dev.showConsoleMessages && dev.isDev) console.log(response);

        if (response.error === 'coin is busy processing') {
          coinsInfo[index].connection = true;
          coinsInfo[index].RT = false;
        }

        if (response.result && response.result.relayfee) {
          coinsInfo[index].relayFee = response.result.relayfee;
        }

        if (
          response.result && response.result.walletversion ||
          response.result && response.result.difficulty ||
          response.result === 'success'
        ) {
          if (dev.showConsoleMessages && dev.isDev) console.log('portp2p con test passed');
          if (dev.showConsoleMessages && dev.isDev) console.log(index + ' daemon is detected');
          coinsInfo[index].connection = true;

          // non-iguana
          // sync info
          if (!isIguana) {
            var networkCurrentHeight = 0, //apiProto.prototype.getCoinCurrentHeight(index); temp disabled
              coindCheckRTResponse = apiProto.prototype.coindCheckRT(index),
              syncPercentage = (response.result.blocks * 100 / networkCurrentHeight).toFixed(2);

            if (dev.showConsoleMessages && dev.isDev)
              console.log('Connections: ' + response.result.connections);
            if (dev.showConsoleMessages && dev.isDev)
              console.log('Blocks: ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== 'Infinity' ? syncPercentage : 'N/A ') + '% synced)');

            if (response.result.blocks === networkCurrentHeight || coindCheckRTResponse) {
              isRT = true;
              coinsInfo[index].RT = true;
            } else {
              isRT = false;
              coinsInfo[index].RT = false;
              if (dev.showConsoleMessages && dev.isDev) console.log('RT is not ready yet!');
            }

            if (dev.isDev && dev.showSyncDebug) {
              //TODO change this function to angular
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
            //TODO change this function to angular
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

          this.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug) // debug info
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
          setInterval(function() {
            //TODO change this function to angular
            if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
          }, 1000);

          cb.call();
        }
        _index++;

      }.bind(this), function errorCallback(response) {

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

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) {
          helper.setPortPollResponse();
          helper.checkIfIguanaOrCoindIsPresent();
        }

        if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index && cb) {
          if (dev.showConsoleMessages && dev.isDev) {
            console.log('port poll done ' + _index);
          }

          this.checkBackEndConnectionStatus();

          if (dev.isDev && dev.showSyncDebug) { // debug info
            //TODO change this function to angular
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
          }

          setInterval(function() {
            //TODO change this function to angular
            if ($('.transactions-unit')) {
              $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
            }
            $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
          }, 1000);

          cb.call();
        }
        _index++;

      }.bind(this));
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
    }).then(function successCallback(_response) {
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
    }.bind(this), function errorCallback(response) {
      if (response.responseText) {
        if (response.responseText.indexOf(':-15') > -1) result = -15;
        if (dev.showConsoleMessages && dev.isDev) console.log(response.responseText);
      } else {
        if (dev.showConsoleMessages && dev.isDev) console.log(response);
      }
    }.bind(this));
  }

}]);