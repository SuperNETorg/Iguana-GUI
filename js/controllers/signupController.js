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
    $scope.passphrase = '';
    $scope.activeCoins = $storage['iguana-login-active-coin'] || {};
    $scope.passphraseCount = $storage.isIguana ? 24 : 12;
    $scope.title = setTitle();
    $rootScope.background = false;

    $scope.copyPassphraseWord = copyPassphraseWord;
    $scope.addAccount = addAccount;
    $scope.verifyPass = verifyPass;
    $scope.getActiveCoins = getActiveCoins;
    $scope.$on('$destroy', destroy);
    $scope.karma = { // tests
      onInit: onInit,
      isCoinSelected: isCoinSelected,
      setTitle: setTitle,
      destroy: destroy
    };

    isCoinSelected();

    if (!vars.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      if ($state.current.name === 'signup.step1') {
        $scope.passphrase = $passPhraseGenerator.generatePassPhrase($storage['isIguana'] ? 8 : 4);
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

      if ($scope.passphrase.length) {
        $api.walletEncrypt($scope.passphrase, selectedCoindToEncrypt)
        .then(onResolve, onReject);
      } else {
        $message.ngPrepMessageModal(
          $filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'),
          'red'
        );
      }

      function onResolve() {
        var msg = $message.ngPrepMessageModal(
          selectedCoindToEncrypt + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'),
          'green'
        );

        if ($storage['dashboard-pending-coins']) {
          msg.closed.then(function() {
            $auth.login(
              $scope.getActiveCoins(),
              $scope.passphrase,
              false
            );
          });
        } else {
          $state.go('login');
        }
      }

      function onReject(response) {
        if (response === -15) {
          $message.ngPrepMessageModal(
            $filter('lang')('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'),
            'red'
          );

          $state.go('login');
        }
      }
    }

    function setTitle() {
      pageTitle = $filter('lang')('CREATE_ACCOUNT.ADD_ACCOUNT');

      if (
        $storage['iguana-login-active-coin'] &&
        Object.keys($storage['iguana-login-active-coin']).length &&
        $scope.activeCoins[Object.keys($scope.activeCoins)[0]]
      ) {
        pageTitle = pageTitle.replace('{{ coin }}', $scope.activeCoins[Object.keys($scope.activeCoins)[0]].name);
      }

      return pageTitle;
    }

    function verifyPass() {
      $scope.buttonCreateAccount = false;
    }

    function isCoinSelected() {
      if (
        !$storage['iguana-login-active-coin'] ||
        !Object.keys($storage['iguana-login-active-coin']).length
      ) {
        $state.go('login');

        return false;
      } else {
        return Object.keys($storage['iguana-login-active-coin']).length === 0;
      }
    }

    function destroy() {
      $storage.passphrase = '';
      $storage['iguana-login-active-coin'] = {};
      $storage['iguana-active-coin'] = {};
    }
  }
]);