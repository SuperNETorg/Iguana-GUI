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
    function ($storage, $syncStatus, vars,
              $api, $state, $rootScope,
              util, $message, $filter) {
      var self = this;
      var minEpochTimestamp = 1471620867; // Jan 01 1970
      var coinsInfo = vars.coinsInfo;
      this.$syncStatus = $syncStatus;
      this.coindWalletLockResults = [];
      this.isExecCopyFailed = false;
      this.coindWalletLockCount = 0;
      this.coinsSelectedToAdd = [];
      this.checkSession = function () {
        var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
          secondsElapsedSinceLastAuth =
            Number(currentEpochTime) - Number(($storage['iguana-auth'] ? $storage['iguana-auth'].timestamp : 1000) / 1000);
        if (Math.floor(secondsElapsedSinceLastAuth) <
          Number($storage['isIguana'] ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind)) {
          return true;
        } else {
          return false;
        }
      };
      this.login = function (coinsSelectedToAdd, passphraseModel) {
        var coinsSelectedToAdd = util.reindexAssocArray(coinsSelectedToAdd);
        this.coinsSelectedToAdd = coinsSelectedToAdd;
        debugger
        $api.walletEncrypt(passphraseModel, coinsSelectedToAdd[0].coinId).then(function (ddd) {
          debugger
          $api.walletLock(coinsSelectedToAdd[0].coinId).then(function (dd) {
            debugger
            $api.walletLogin(passphraseModel,
              settings.defaultSessionLifetime,
              coinsSelectedToAdd[0].coinId).then(onResolve, onReject)
          });
        })
        function onResolve() {
          $storage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = {'logged': 'yes'};
          $storage['iguana-auth'] = {'timestamp': Date.now()};
          $state.go('dashboard.main');
          $storage['iguana-login-active-coin'] = [];
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
        }

        //TODO: tu be removed
        function walletLoginThen(walletLogin) {
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
          } else {
            $storage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = {'logged': 'yes'};
            $storage['iguana-auth'] = {'timestamp': Date.now()};
            $state.go('dashboard.main');
            $storage['iguana-login-active-coin'] = [];
          }
        }
      };
      this.logout = function () { // TODO: move to auth service
        if ($storage['isIguana']) {
          $api.walletLock();
          $storage['iguana-auth'] = {'timestamp': this.minEpochTimestamp};
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
            $storage['iguana-auth'] = {'timestamp': this.minEpochTimestamp};
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
        $storage['iguana-' + key + '-passphrase'] = {'logged': 'no'};
        if (Object.keys(this.coindWalletLockResults).length === this.coindWalletLockCount) {
          $storage['iguana-auth'] = {'timestamp': this.minEpochTimestamp}; // Jan 01 1970
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

      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        self['toState'] = toState;
        self['toParams'] = toParams;
        self['fromState'] = fromState;
        self['fromParams'] = fromParams;
        checkUserIdentify.apply(self, [toState, fromState]);
      });
      $rootScope.$broadcast('$auth', this.logout);
    }]);