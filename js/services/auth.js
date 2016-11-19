'use strict';

angular.module('IguanaGUIApp')
.service('$auth', [
  '$storage',
  '$syncStatus',
  'vars',
  '$api',
  '$state',
  '$rootScope',
  'util',
  '$message',
  '$filter',
  '$timeout',
  '$q',
  function ($storage, $syncStatus, vars,
            $api, $state, $rootScope, util,
            $message, $filter, $timeout, $q) {

    var self = this,
        minEpochTimestamp = 1471620867, // Jan 01 1970
        coinsInfo = vars.coinsInfo;

    this.$syncStatus = $syncStatus;
    this.coindWalletLockResults = [];
    this.isExecCopyFailed = false;
    this.coindWalletLockCount = 0;
    this.coinsSelectedToAdd = [];
    this.coinResponses = [];
    this.receivedObject = [];
    this.addedCoinsOutput = '';
    this.failedCoinsOutput = '';
    this.passphraseModel = '';

    this.checkSession = function() {
      var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
          secondsElapsedSinceLastAuth =
            Number(currentEpochTime) - Number(($storage['iguana-auth'] ? $storage['iguana-auth'].timestamp : 1000) / 1000);

      if (Math.floor(secondsElapsedSinceLastAuth) <
        Number($storage['isIguana'] ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind)) {
        return true;
      } else {
        this.logout();
        return false;
      }
    };

    this.login = function(receivedObject, coinsSelectedToAdd, passphraseModel, addCoinOnly) {
      self.coinsSelectedToAdd = util.reindexAssocArray(coinsSelectedToAdd);
      self.passphraseModel = passphraseModel;
      self.receivedObject = receivedObject;

      if ($storage['isIguana']) {
        checkIguanaCoinsSelection(false, addCoinOnly)
        .then(function(data) {
          self.coinResponses = data;

          if (!addCoinOnly)
            $api.walletEncrypt(passphraseModel, coinsSelectedToAdd[0].coinId)
            .then(function(ddd) {
              return walletLogin();
            });
          else
            return data;
        });
      } else {
        return walletLogin();
      }

      function inguanaLogin() {
        // var defer = $q.defer();
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
        var deferred = $q.defer();

        $api.walletLock(coinsSelectedToAdd[0].coinId).then(function(dd) {
          $api.walletLogin(passphraseModel,
            settings.defaultSessionLifetime,
            coinsSelectedToAdd[0].coinId).then(onResolve, onReject)
        });

        function onResolve(data) {
          $storage['iguana-auth'] = { 'timestamp': Date.now() };

          if ($storage['isIguana']) {
            inguanaLogin();
          } else {
            $storage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = { 'logged': 'yes' };
            $state.go('dashboard.main');
          }

          $storage['iguana-login-active-coin'] = [];
          deferred.resolve(data)
        }

        function onReject(result) {
          var walletLogin = result[0];

          if (walletLogin === -14 || walletLogin === false) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.WRONG_PASSPHRASE'),
              'red',
              true);
          } else if (walletLogin === -15) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'),
              'red',
              true
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
          $storage['iguana-' + key + '-passphrase'].logged === 'no';
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

    function _checkSession() {
      this.checkSession();
    }

    // TODO: not handled all states!!!
    function checkUserIdentify(toState) {
      if (!$storage['iguana-auth']) {
        self.logout();
      } else {
        if (!_checkSession) {
          if (toState.name !== 'login') {
            $state.go('login');
          }
        } else {
          if (toState.name !== 'dashboard') {
            $state.go('dashboard');
          }
        }
      }
    }

    function checkIguanaCoinsSelection(suppressAddCoin, addCoinOnly) {
      var defer = $q.defer();

      if (!suppressAddCoin) {
        for (var key in vars.coinsInfo) {
          $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };
        }

        $api.addCoins(self.receivedObject, 0).then(onResolve);
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
            if (!addCoinOnly)
              $storage['iguana-' + coin + '-passphrase'] = { 'logged': 'no' };
          }
        }

        self.addedCoinsOutput = util.trimComma(self.addedCoinsOutput);
        self.failedCoinsOutput = util.trimComma(self.failedCoinsOutput);

        defer.resolve(coinResponses);
      }

      return defer.promise;
    }

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
      self.toState = toState;
      self.toParams = toParams;
      self.fromState = fromState;
      self.fromParams = fromParams;

      checkUserIdentify.apply(self, [toState, fromState]);
    });

    $rootScope.$broadcast('$auth', this.logout);
  }
]);