'use strict';

angular.module('IguanaGUIApp')
.controller('signupController', [
  '$scope',
  '$http',
  '$state',
  'util',
  '$passPhraseGenerator',
  '$storage',
  '$api',
  '$rootScope',
  '$uibModal',
  '$filter',
  '$message',
  'vars',
  '$auth',
  function($scope, $http, $state, util, $passPhraseGenerator, $storage,
           $api, $rootScope, $uibModal, $filter, $message, vars, $auth) {

    var pageTitle;

    $scope.util = util;
    $scope.$state = $state;
    $scope.passphraseCheckbox = false;
    $scope.buttonCreateAccount = false;
    $scope.$localStorage = $storage;
    $scope.coins = [];
    $scope.isIguana = $storage.isIguana;
    $scope.passphrase = '';
    $scope.activeCoins = $storage['iguana-login-active-coin'] || {};
    $scope.passphraseCount = $storage.isIguana ? 24 : 12;
    $scope.title = setTitle();
    $rootScope.background = false;

    $scope.copyPassphraseWord = copyPassphraseWord;
    $scope.addAccount = addAccount;
    $scope.goBack = goBack;
    $scope.verifyPass = verifyPass;
    $scope.getActiveCoins = getActiveCoins;
    $scope.validateStep3 = validateStep3;
    $scope.$on('$destroy', destroy);
    $scope.karma = { // tests
      onInit: onInit,
      isCoinSelected: isCoinSelected,
      setTitle: setTitle,
      destroy: destroy
    };
    $scope.coinColors = [
      'orange',
      'breeze',
      'light-blue',
      'yellow'
    ];

    if ($storage.isIguana) {
      $scope.title = setTitle($filter('lang')('IGUANA.APP_TITLE'));
    }

    if (!vars.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      isCoinSelected();

      if (
        ($state.current.name === 'signup' && $storage.isIguana) ||
        ($state.current.name === 'signup.step1' && !$storage.isIguana)
      ) {
        $scope.passphrase = $passPhraseGenerator.generatePassPhrase($storage.isIguana ? 8 : 4);
        $storage.passphrase = $scope.passphrase;
      }
    }

    function getActiveCoins() {
      return $storage['iguana-login-active-coin'];
    }

    function copyPassphraseWord($event) {
      util.execCommandCopy(angular.element($event.target), $filter('lang')('LOGIN.PASSPHRASE'));
    }

    function addAccount() {
      $storage['passphrase'] = '';

      var coinKeys = Object.keys($scope.getActiveCoins()),
          selectedCoindToEncrypt = $scope.getActiveCoins()[coinKeys[0]].coinId;

      if (
        (
          $storage.isIguana &&
          $scope.passphraseModel.split(' ').length === 24
        ) || (
          !$storage.isIguana &&
          $scope.passphraseModel.split(' ').length === 12
        )
      ) {
        if ($storage.isIguana) {
          $auth.coinsSelectedToAdd = $storage['iguana-login-active-coin'];
          $auth
            .checkIguanaCoinsSelection(true)
            .then(
              function(response) {
                $api
                  .walletEncrypt($scope.passphrase, selectedCoindToEncrypt)
                  .then(onResolve, onReject);
              },
              function(reason) {
                if (dev.showConsoleMessages && dev.isDev) {
                  console.log('request failed: ', reason);
                }
              }
            );
        } else {
          $api.walletEncrypt($scope.passphrase, selectedCoindToEncrypt)
          .then(onResolve, onReject);
        }
      } else {
        $message.ngPrepMessageModal(
          $filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'),
          'red'
        );
      }

      function onResolve() {
        var msg = $message.ngPrepMessageModal(
          coinKeys.join(', ') + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'),
          'green'
        );

        msg.closed.then(function() {
          $auth.login(
            $scope.getActiveCoins(),
            $scope.passphraseModel,
            false
          );
        });
        /*if ($storage['dashboard-pending-coins']) {

        } else {
          $state.go('login');
        }*/
      }

      function onReject(response) {
        var message = '',
            color = '';

        if (response === -15) {
          message = $filter('lang')('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED');
          color = 'red';

          $state.go('login');
        } else if (
          response.message &&
          response.message.indexOf('connect ECONNREFUSED') !== -1
        ) {
          message = $filter('lang')('MESSAGE.NO_DAEMON_IS_RUNNING');
          color = 'red';
        } else if (response === -1) {
          message = $filter('lang')($scope.isIguana ? 'MESSAGE.IGUANA_IS_NOT_SET_UP' : 'MESSAGE.PROXY_IS_NOT_SET_UP');
          color = 'red';
        }
        $message.ngPrepMessageModal(
          message,
          color
        );
      }
    }

    function setTitle() {
      var coinNames = [];

      pageTitle = $filter('lang')('CREATE_ACCOUNT.ADD_ACCOUNT');

      if (!$storage.isIguana) {
        if (
          $storage['iguana-login-active-coin'] &&
          Object.keys($storage['iguana-login-active-coin']).length &&
          $scope.activeCoins[Object.keys($scope.activeCoins)[0]]
        ) {
          for (var name in $scope.activeCoins) {
            coinNames.push($scope.activeCoins[name].name);
          }
        }
      } else {
        coinNames = ['Iguana'];
      }

      pageTitle = pageTitle.replace('{{ coin }}', coinNames.join(', '));

      return pageTitle;
    }

    function verifyPass() {
      $scope.buttonCreateAccount = false;
    }

    function constructCoinRepeater(coinName) {
      var index = 0,
        coinsArray = {},
        coinsInfo = vars.coinsInfo;

      if (coinsInfo) {
        for (var key in supportedCoinsList) {
          if (
            (!$storage['iguana-' + key + '-passphrase'] ||
              (
                $storage['iguana-' + key + '-passphrase'] &&
                ($storage['iguana-' + key + '-passphrase'].logged !== 'yes' ||
                ($storage['iguana-' + key + '-passphrase'].logged === 'yes' &&
                ($state.current.name.indexOf('login') > -1 || $state.current.name.indexOf('signup') > -1)))
              )
            )
          ) {
            if (
              ($storage.isIguana && coinsInfo[key] && coinsInfo[key].iguana === true) ||
              (
                !$storage.isIguana &&
                (coinsInfo[key] &&
                  coinsInfo[key].connection === true ||
                  (dev && dev.isDev && dev.showAllCoindCoins)
                )
              )
            ) {
              if (coinName === key) {
                coinsArray[key] = {
                  'id': key.toUpperCase(),
                  'coinId': key.toLowerCase(),
                  'name': supportedCoinsList[key].name,
                  'color': $scope.coinColors[index],
                  'pass': dev.isDev && !$storage.passphrase ? getPassphrase(key) : ''
                }
              }

              if (index === $scope.coinColors.length - 1) {
                index = 0;
              } else {
                index++;
              }
            }
          }
        }
      }

      return coinsArray;
    }

    function getPassphrase(coinId) {
      if (dev && dev.coinPW) {
        return ($scope.isIguana && dev.coinPW.iguana ? dev.coinPW.iguana :
          (dev.coinPW.coind[coinId] ? dev.coinPW.coind[coinId] : ''));
      } else {
        return '';
      }
    }

    function isCoinSelected() {
      if (
        !$storage.isIguana &&
        !$storage['iguana-login-active-coin'] &&
        !Object.keys($storage['iguana-login-active-coin']).length
      ) {
        $state.go('login');

        return false;
      } else {
        $storage['iguana-login-active-coin'] = constructCoinRepeater('kmd');
      }

      return Object.keys($storage['iguana-login-active-coin']).length === 0;
    }

    function openCoinModal() {
      $storage['iguana-active-coin'] = {};
      $scope.modal.coinModal.appendTo = angular.element(document.querySelector('.auth-add-coin-modal'));
      $scope.modal.coinModal.resolve = {
        'type': function() {
          return 'signup';
        },
        'modal': function() {
          return $scope.modal;
        }
      };
      var modalInstance = $uibModal.open($scope.modal.coinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise() {
        $state.go('signup.step3');
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function goBack() {
      $scope.modal.coinModal.animation = false;
      $storage['iguana-login-active-coin'] = {};
      $state.go('login');//.then(openCoinModal);
    }

    function destroy() {
      $storage.passphrase = '';
      $storage['iguana-login-active-coin'] = {};
      $storage['iguana-active-coin'] = {};
    }

    function validateStep3() {
      if (
          (
            $storage.isIguana &&
            $scope.passphraseModel.split(' ').length < 24
          ) ||
          $scope.passphraseModel != $storage.passphrase
      ) {
        var message = $filter('lang')('MESSAGE.INCORRECT_INPUT_P3'),
            color = 'red';

        $message.ngPrepMessageModal(
          message,
          color
        );
      } else {
        if (!$storage.isIguana) {
          $state.go('signup.step3');
        } else {
          openCoinModal('signup')
        }
      }
    }
  }
]);