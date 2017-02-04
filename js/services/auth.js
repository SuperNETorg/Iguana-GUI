'use strict';

angular.module('IguanaGUIApp')
.service('$auth', [
  '$storage',
  'vars',
  '$api',
  '$state',
  'util',
  '$q',
  '$filter',
  '$message',
  '$rootScope',
  '$window',
  function($storage, vars, $api, $state, util, $q, $filter, $message, $rootScope, $window) {

    var self = this;
    vars.$auth = this;

    this.coindWalletLockResults = [];
    this.isExecCopyFailed = false;
    this.coindWalletLockCount = 0;
    this.coinsSelectedToAdd = {};
    this.coinResponses = [];
    this.receivedObject = [];
    this.addedCoinsOutput = '';
    this.failedCoinsOutput = '';
    this.passphraseModel = '';
    this.minEpochTimestamp = settings.minEpochTimestamp; // Jan 01 1970

    this.checkSession = function(returnVal) {
      var inLogin = self.toState.name.indexOf('login') != -1,
          inSignup = self.toState.name.indexOf('signup') != -1,
          inAuth = (inLogin || inSignup),
          inDashboard = (self.toState.name.indexOf('dashboard') != -1);

      if (
        inLogin &&
        $storage['dashboard-pending-coins'] &&
        (
          $storage['iguana-login-active-coin'] &&
          Object.keys($storage['iguana-login-active-coin']).length
        )
      ) {
        if (!$rootScope.allowLoginStateChange && !self._userIdentify()) // temp(?)
          $state.go('signup.step1');
        return;
      }

      returnVal = (
        returnVal ?
          returnVal :
          (
            $storage['dashboard-pending-coins'] && !!(
              $storage['iguana-login-active-coin'] ?
                Object.keys($storage['iguana-login-active-coin']).length :
                0
            )
          )
      );

      if (returnVal) {
        return self._userIdentify();
      } else {
        if (!$storage['iguana-auth']) {
          self.logout();
        } else {
          if (!self._userIdentify()) {
            if (!inAuth) {
              $state.go('login');
              $storage['dashboard-logged-in-coins'] = {};
            }
          } else {
            if (!inDashboard && !$rootScope.allowLoginStateChange) {
              $state.go('dashboard.main');
            }
          }
        }
      }
    };

    this._userIdentify = function() {
      var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
          secondsElapsedSinceLastAuth =
            Number(currentEpochTime) - Number(($storage['iguana-auth'] ?
                $storage['iguana-auth'].timestamp : 1000) / 1000);

      return (!$storage['dashboard-pending-coins'] ? Math.floor(secondsElapsedSinceLastAuth) <
        Number(
          $storage.isIguana ?
            settings.defaultSessionLifetimeIguana :
            settings.defaultSessionLifetimeCoind
        ) : true);
    };

    this.login = function(coinsSelectedToAdd, passphraseModel, addCoinOnly) {
      if (!$storage['dashboard-logged-in-coins']) {
        $storage['dashboard-logged-in-coins'] = {};
      }

      self.coinsSelectedToAdd = coinsSelectedToAdd;
      self.passphraseModel = passphraseModel;

      for (var name in coinsSelectedToAdd) {
        if (!$storage['dashboard-logged-in-coins'][name]) {
          $storage['dashboard-logged-in-coins'][name] = coinsSelectedToAdd[name];
        }
      }

      return this.commonLogin(addCoinOnly);
    };

    this.loginCheck = function(coinsSelectedToAdd, passphraseModel, addCoinOnly) {
      self.coinsSelectedToAdd = coinsSelectedToAdd;
      self.passphraseModel = passphraseModel;

      return this.commonLogin(addCoinOnly, false, true);
    };

    this.loginEasyDEX = function() {
      if (!Object.keys(self.coinsSelectedToAdd).length) {
        self.coinsSelectedToAdd = $storage['dashboard-logged-in-coins'];
      }

      var coinKeys = Object.keys(self.coinsSelectedToAdd);

      if (!self.passphraseModel) {
        self.passphraseModel = self.coinsSelectedToAdd[coinKeys[0]].pass;
      }

      walletLogin(true)
        .then(
          function(response) {
            var presponse = JSON.stringify(response[0].data),
                locationSplit;

            presponse = JSON.stringify(presponse);
            sessionStorage.setItem('IguanaActiveAccount', presponse);

            if ($rootScope.isElectron) {
              $window.location.href = 'http://127.0.0.1:17777/gui/EasyDEX-GUI/index.html';
            } else if (
              $window.location.href.indexOf('localhost') > -1 ||
              $window.location.href.indexOf('127.0.0.1') > -1
            ) {
              locationSplit = $window.location.href.split('#');

              if (locationSplit[0]) {
                $window.location.href = locationSplit[0] + 'EasyDEX-GUI/index.html';
              }
            } else {
              locationSplit = $window.location.href.split('index.html');

              if (locationSplit[0]) {
                $window.location.href = locationSplit[0] + 'EasyDEX-GUI/index.html';
              }
            }
          }
        );
    };

    this.commonLogin = function(addCoinOnly, edexRedirect, isCheck) {
      if (!Object.keys(self.coinsSelectedToAdd).length) {
        self.coinsSelectedToAdd = $storage['dashboard-logged-in-coins'];
      }

      var coinKeys = Object.keys(self.coinsSelectedToAdd);

      if ($storage.isIguana) {
        var deferred = $q.defer(),
            suppressAddCoin =
              $storage['dashboard-pending-coins'] ?
                $storage['dashboard-pending-coins'] :
                false;

        delete $storage['dashboard-pending-coins'];

        // TODO: Temporary solution for the userpass
        if (!isCheck && !$api.Iguana_GetRPCAuth()) {
          $api.Iguana_GenerateRPCAuth();
        }

        this
          .checkIguanaCoinsSelection(suppressAddCoin, addCoinOnly)
          .then(
            function(data) {
              self.coinResponses = data;

              if (!addCoinOnly) {
                if (!self.passphraseModel && !dev.isDev) {
                  self.passphraseModel = self.coinsSelectedToAdd[coinKeys[0]].pass;
                }

                $api
                .walletEncrypt(
                  self.passphraseModel,
                  self.coinsSelectedToAdd[coinKeys[0]].coinId)
                .then(function() {
                  walletLogin(edexRedirect, isCheck);
                });
              } else {
                deferred.resolve(data);
              }
            }/*,
            function(response) {
              //TODO: Iguana connection error messages are here
            }*/);

        return deferred.promise;
      } else {
        return walletLogin(false, isCheck)
                .catch(
                  function(messages) {
                    var message = messages[2];
                    $message.ngPrepMessageModal($filter('lang')(message), 'red');
                  }
                );
      }
    };

    this.logout = function(coin) {
      if ($storage.isIguana) {
        if (!coin) {
          for (var name in $storage['dashboard-logged-in-coins']) {
            $api.walletLock($storage['dashboard-logged-in-coins'][name].coinId);
          }
        } else {
          $api.walletLock(coin);
        }

        for (var key in supportedCoinsList) {
          if ($storage['iguana-' + key + '-passphrase'] &&
              !$storage['dashboard-pending-coins']) {
            $storage['iguana-' + key + '-passphrase'].logged = 'no';
          }
        }

        $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp };
        $state.go('login');
      } else {
        this.coindWalletLockCount = 0;

        if (vars.coinsInfo !== undefined) {
          for (var key in vars.coinsInfo) {
            if ($storage['iguana-' + key + '-passphrase'] &&
              $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
              this.coindWalletLockCount++;
            }
          }
        }
        // in case something went bad
        if (this.coindWalletLockCount === 0) {
          $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp };
          $state.go('login');
        }

        this.logoutCoind();
      }

      $storage['dashboard-logged-in-coins'] = {};

      util.removeStorageItems([
        'feeSettings',
        'passphrase',
        'rates',
        'iguanaNullReturnCount',
        'guiModeAtLogin'
      ]);
    };

    this.logoutCoind = function() {
      if (vars.coinsInfo !== undefined) {
        for (var key in vars.coinsInfo) {
          if ($storage['iguana-' + key + '-passphrase'] &&
            $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
            $api.walletLock(key, this.logoutCoindCB(key)); // TODO: promise
          }
        }
      }
    };

    this.logoutCoindCB = function(key) {
      this.coindWalletLockResults[key] = true;
      $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };

      if (Object.keys(this.coindWalletLockResults).length === this.coindWalletLockCount) {
        $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp };
        $state.go('login');
      }
    };

    this.checkIguanaCoinsSelection = function(suppressAddCoin, addCoinOnly) {
      var defer = $q.defer(),
          coinsSelectedToAdd = util.reindexAssocArray(self.coinsSelectedToAdd);

      if (!suppressAddCoin) {
        if (!addCoinOnly) {
          for (var key in vars.coinsInfo) {
            $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };
          }
        }
      }

      if (coinsSelectedToAdd.length) {
        $api.addCoins(coinsSelectedToAdd, 0).then(onResolve, onReject);
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
            self.failedCoinsOutput += coin.toUpperCase() + ', ';
          }
        }

        self.addedCoinsOutput = util.trimComma(self.addedCoinsOutput);
        self.failedCoinsOutput = util.trimComma(self.failedCoinsOutput);

        defer.resolve(coinResponses);
      }

      function onReject(response) {
        defer.reject(response);
      }

      return defer.promise;
    };

    function walletLogin(edexRedirect, isCheck) {
      var deferred = $q.defer(),
          coinsSelectedToAdd = util.reindexAssocArray(self.coinsSelectedToAdd),
          coinKeys = util.getCoinKeys(coinsSelectedToAdd);

      if (!self.passphraseModel) {
        self.passphraseModel = self.coinsSelectedToAdd[coinKeys[0]].pass;
      } else {
        self.coinsSelectedToAdd[coinKeys[0]].pass = self.passphraseModel;
      }

      $api.walletLock(self.coinsSelectedToAdd[coinKeys[0]].coinId)
        .then(
          function() {
            $api.walletLogin(
              self.passphraseModel,
              settings.defaultSessionLifetime,
              self.coinsSelectedToAdd[coinKeys[0]].coinId
            ).then(onResolve, onReject)
          },
          function(response) {
            var message = '',
                color = 'red';

            if (response.data) {
              if (response.data.error) {
                if (response.data.error.code === -15) {
                  message = 'MESSAGE.NO_WALLET_IS_ENCRYPTED';
                } else if (response.data.error === 'authentication error') {
                  message = 'MESSAGE.AUTHENTICATION_ERROR';
                }
              }

              if (response.data.message) {
                if (response.data.message.indexOf('connect ECONNREFUSED') !== -1) {
                  message = 'MESSAGE.NO_DAEMON_IS_RUNNING';
                }
              }
            }

            if (response.status === -1) {
              message = $storage.isIguana ? 'MESSAGE.IGUANA_IS_NOT_SET_UP' : 'MESSAGE.PROXY_IS_NOT_SET_UP';
            }

            $message.ngPrepMessageModal(
              $filter('lang')(message),
                color
            );
          }
        );

      function onResolve(data) {
        if (typeof isCheck == 'undefined') {
          isCheck = false;
        }

        if (!isCheck) {
          $storage['iguana-auth'] = { 'timestamp': Date.now() };

          if (!$storage.isIguana) {
            $storage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = { 'logged': 'yes' };
          }

          $storage['iguana-login-active-coin'] = {};

          if (!edexRedirect) {
            $storage.guiModeAtLogin = $storage.isIguana;
            $state.go('dashboard.main');
          }
        } else {
          if (!edexRedirect) {
            $state.go('login.step3');
          }
        }
        deferred.resolve(data);
      }

      function onReject(result) {
        var walletLogin = result[0],
            message;

        if (walletLogin === -14 || walletLogin === false) {
          message = 'MESSAGE.INCORRECT_INPUT_P3';
        } else if (walletLogin === -15) {
          message = 'MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET';
        }

        result.push(message);
        deferred.reject(result);
      }

      return deferred.promise;
    }
  }
]);