'use strict';

angular.module('IguanaGUIApp')
.service('$auth', [
  '$storage',
  'vars',
  '$api',
  '$state',
  '$rootScope',
  'util',
  '$message',
  '$filter',
  '$timeout',
  '$q',
  function ($storage, vars,
            $api, $state, $rootScope, util,
            $message, $filter, $timeout, $q) {

    var self = this,
        minEpochTimestamp = 1471620867; // Jan 01 1970

    this.coindWalletLockResults = [];
    this.isExecCopyFailed = false;
    this.coindWalletLockCount = 0;
    this.coinsSelectedToAdd = [];
    this.coinResponses = [];
    this.receivedObject = [];
    this.addedCoinsOutput = '';
    this.failedCoinsOutput = '';
    this.passphraseModel = '';

    this.checkSession = function(returnVal) {
      var inAuth = (self.toState.name.indexOf('login') != -1 ||
                    self.toState.name.indexOf('signup') != -1);
      var inDashboard = (self.toState.name.indexOf('dashboard') != -1);

      if (returnVal) {
        return this._userIdentify();
      } else {
        if (!$storage['iguana-auth']) {
          self.logout();
        } else {
          if (!self._userIdentify()) {
            if (!inAuth) {
              $state.go('login');
            }
          } else {
            if (!inDashboard) {
              $state.go('dashboard.main');
            }
          }
        }
      }
    };

    this._userIdentify = function () {
      var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
        secondsElapsedSinceLastAuth =
          Number(currentEpochTime) - Number(($storage['iguana-auth'] ?
              $storage['iguana-auth'].timestamp : 1000) / 1000);

      if (
        Math.floor(secondsElapsedSinceLastAuth) <
        Number($storage['isIguana'] ? settings.defaultSessionLifetimeIguana :
          settings.defaultSessionLifetimeCoind)
      ) {
        return true;
      } else {
        return false;
      }
    };

    this.login = function(coinsSelectedToAdd, passphraseModel, addCoinOnly) {
      var coinKeys = Object.keys(coinsSelectedToAdd);
      self.coinsSelectedToAdd = coinsSelectedToAdd;
      self.passphraseModel = passphraseModel;

      if ($storage['isIguana']) {
        var deferred = $q.defer();

        checkIguanaCoinsSelection(false, addCoinOnly)
        .then(function(data) {
          self.coinResponses = data;

          if (!addCoinOnly) {
            $api.walletEncrypt(passphraseModel, coinsSelectedToAdd[coinKeys[0]].coinId)
                .then(walletLogin);
          } else {
            deferred.resolve(data);
          }
        });

        return deferred.promise;
      } else {
        return walletLogin();
      }

      function inguanaLogin() {
        var message = $message.ngPrepMessageModal(
          self.addedCoinsOutput + ' ' +
          $filter('lang')('MESSAGE.COIN_ADD_P1') +
          (
            self.failedCoinsOutput.length > 7 ?
            self.failedCoinsOutput + ' ' + $filter('lang')('MESSAGE.COIN_ADD_P2') : ''
          ) +
          (
            self.coinResponses.length ?
            '<br/>' + $filter('lang')('MESSAGE.REDIRECTING_TO_DASHBOARD') + '...'
              : ''
          ), 'green', true);

        if (self.coinResponses.length) {
          // since there's no error on nonexistent wallet passphrase in Iguana
          // redirect to dashboard with 5s timeout
          // TODO(?): point out if a coin is already running
          $timeout(function () {
            console.log(message);
            message.close();
            $state.go('dashboard.main');
          }, settings.addCoinInfoModalTimeout * 1000);
        }
      }

      function walletLogin() {
        var deferred = $q.defer(),
            coinsSelectedToAdd = util.reindexAssocArray(self.coinsSelectedToAdd);
        var coinKeys = util.getCoinKeys(coinsSelectedToAdd);

        $api.walletLock(self.coinsSelectedToAdd[coinKeys[0]].coinId).then(function() {
          $api.walletLogin(passphraseModel, settings.defaultSessionLifetime,
            self.coinsSelectedToAdd[coinKeys[0]].coinId).then(onResolve, onReject)
        });

        function onResolve(data) {
          $storage['iguana-auth'] = { 'timestamp': Date.now() };

          if ($storage['isIguana']) {
            inguanaLogin();
          } else {
            $storage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = { 'logged': 'yes' };
            $state.go('dashboard.main');
          }

          $storage['iguana-login-active-coin'] = {};
          deferred.resolve(data);
        }

        function onReject(result) {
          var walletLogin = result[0];

          if (walletLogin === -14 || walletLogin === false) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.WRONG_PASSPHRASE'),
              'red');
          } else if (walletLogin === -15) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'),
              'red'
            );
          }

          deferred.reject(result);
        }

        return deferred.promise;
      }
    };

    this.logout = function () { // TODO: move to auth service
      if ($storage['isIguana']) {
        $api.walletLock();

        for (var key in supportedCoinsList) {
          if ($storage['iguana-' + key + '-passphrase'])
            $storage['iguana-' + key + '-passphrase'].logged = 'no';
        }

        $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp };
        $state.go('login');
      } else {
        this.coindWalletLockCount = 0;

        if (vars.coinsInfo != undefined)
          for (var key in vars.coinsInfo) {
            if ($storage['iguana-' + key + '-passphrase'] &&
              $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
              this.coindWalletLockCount++;
            }
          }
        // in case something went bad
        if (this.coindWalletLockCount === 0) {
          $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp };
          $state.go('login');
        }

        this.logoutCoind();
      }
    };

    this.logoutCoind = function (cb) {
      if (vars.coinsInfo != undefined)
        for (var key in vars.coinsInfo) {
          if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
            $api.walletLock(key, this.logoutCoindCB(key));
          }
        }

      if (cb) cb();
    };

    this.logoutCoindCB = function (key) {
      this.coindWalletLockResults[key] = true;
      $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };

      if (Object.keys(this.coindWalletLockResults).length === this.coindWalletLockCount) {
        $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp }; // Jan 01 1970
        $state.go('login');
      }
    };

    function checkIguanaCoinsSelection(suppressAddCoin, addCoinOnly) {
      var defer = $q.defer(),
          coinsSelectedToAdd = util.reindexAssocArray(self.coinsSelectedToAdd);

      if (!suppressAddCoin) {
        if (!addCoinOnly)
          for (var key in vars.coinsInfo) {
            $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };
          }

        $api.addCoins(coinsSelectedToAdd, 0).then(onResolve);
      } else {
        defer.resolve(true);
      }

      function onResolve(coinResponses) {
        var response,
            coin;

        for (var i = 0; coinResponses.length > i; i++) {
          coin = coinResponses[i][0];
          response = coinResponses[i][1];

          if (response.data.result === 'coin added' ||
            response.data.result === 'coin already there') {

            // if (dev.isDev && dev.showSyncDebug) {
            //   // $('#debug-sync-info').append(coin + ' coin added<br/>');
            // }

            vars.coinsInfo[coin].connection = true; // update coins info obj prior to scheduled port poll
            self.addedCoinsOutput += coin.toUpperCase() + ', ';
            $storage['iguana-' + coin + '-passphrase'] = { 'logged': 'yes' };
          } else {
            self.failedCoinsOutput += coin + ', ';
          }
        }

        self.addedCoinsOutput = util.trimComma(self.addedCoinsOutput);
        self.failedCoinsOutput = util.trimComma(self.failedCoinsOutput);

        defer.resolve(coinResponses);
      }

      return defer.promise;
    }
  }
]);