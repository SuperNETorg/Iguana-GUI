'use strict';

angular.module('IguanaGUIApp')
.service('$auth', ['$storage', 'vars', '$api', '$state', '$rootScope', function ($storage, vars, $api, $state, $rootScope) {
  var minEpochTimestamp = 1471620867; // Jan 01 1970
  var coinsInfo = vars.coinsInfo;

  this.coindWalletLockResults = [];
  this.isExecCopyFailed = false;
  this.coindWalletLockCount = 0;

  this.checkSession = function() {
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

  this.logout = function(noRedirect, cb) { // TODO: move to auth service
    if ($storage['isIguana']) {
      $api.walletLock();
      $storage['iguana-auth'] = { 'timestamp' : this.minEpochTimestamp };
      $state.go('login');
    } else {
      this.coindWalletLockCount = 0;

      if (coinsInfo != undefined)
        for (var key in coinsInfo) {
          if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
            this.coindWalletLockCount++;
          }
        }

      // in case something went bad
      if (this.coindWalletLockCount === 0) {
        $storage['iguana-auth'] = { 'timestamp' : this.minEpochTimestamp };
        $state.go('login');
      }

      this.logoutCoind(cb);
    }
  };

  this.logoutCoind = function(cb) {
    if (coinsInfo != undefined)
      for (var key in coinsInfo) {
        if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
          $api.walletLock(key, this.logoutCoindCB(key));
        }
      }
    if (cb) cb();
  };

  this.logoutCoindCB = function(key) {
    this.coindWalletLockResults[key] = true;
    $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };

    if (Object.keys(this.coindWalletLockResults).length === this.coindWalletLockCount) {
      $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp }; // Jan 01 1970
      $state.go('login');
    }
  };

  // TODO: not handled all states!!!
  function checkUserIdentify(toState) {
    if (!$storage['iguana-auth']) {
      this.logout();
    } else {
      if (!this.checkSession()) {
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
}]);