'use strict';

// TODO: localstorage connected notaries

angular.module('IguanaGUIApp')
.service('$basilisk', [
  '$api',
  '$storage',
  '$rootScope',
  '$interval',
  '$timeout',
  function($api, $storage, $rootScope, $interval, $timeout) {
    var self = this;

    this.connectNotaries = function(from, to) {
      var numNotariesConnected = 0,
          numNotariesFailed = 0;

      $storage.notaries = from;
      for (var i=from; i < to; i++) {
        (function(x) {
          $timeout(function() {
            $api.getNotaryInfo(notariesList[x])
              .then(function(response) {
                if (response.data &&
                    response.data.coin &&
                    response.data.coin === notariesList[x]) {
                  numNotariesConnected++;
                  $storage.notaries++;
                  $rootScope.$broadcast('notaryConnUpdate');

                  if (dev.showConsoleMessages && dev.isDev) {
                    console.log(notariesList[x] + ' notary connected');
                  }
                } else {
                  numNotariesFailed++;
                }

                if (x === to - 1) {
                  if (dev.showConsoleMessages && dev.isDev) {
                    console.log(numNotariesConnected + ' notaries connected, ' + numNotariesFailed + ' notaries failed to connect');
                  }

                  $rootScope.$broadcast('notaryConnUpdateFinished');
                }
              },
              function(response) {
                if (dev.showConsoleMessages && dev.isDev) {
                  console.log('request failed: ', response);
                }

                numNotariesFailed++;

                if (x === to - 1) {
                  if (dev.showConsoleMessages && dev.isDev) {
                    console.log(numNotariesConnected + ' notaries connected, ' + numNotariesFailed + ' notaries failed to connect');
                  }

                  $rootScope.$broadcast('notaryConnUpdateFinished');
                }
              });
          }, settings.notaryRequestDelay * 1000);
        })(i);
      }

      // TODO: restart notary update if num notaries connected is less than settings.initNotariesCount
      /*$interval(function() {
        if ($storage.notaries < settings.initNotariesCount)
          self.connectNotaries($storage.notaries - 1, settings.initNotariesCount);
      }, settings.initNotariesTimeoutCheck * 1000);*/
    };
  }
]);