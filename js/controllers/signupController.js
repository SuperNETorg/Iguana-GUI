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
  '$rates',
  function($scope, $http, $state, util, $passPhraseGenerator, $storage,
           $api, $rootScope, $uibModal, $filter, $message, vars) {
    $scope.util = util;
    $scope.$state = $state;
    $scope.passphraseCheckbox = false;
    $scope.buttonCreateAccount = false;
    $scope.$localStorage = $storage;
    $scope.coins = [];
    $scope.activeCoins = $storage['iguana-login-active-coin'] || {};
    $scope.passphraseCount = $storage['isIguana'] ? 24 : 12;
    $scope.title = setTitle();

    $scope.copyPassphraseWord = copyPassphraseWord;
    $scope.pastPassphraseWord = pastPassphraseWord;
    $scope.addAccount = addAccount;
    $scope.verifyPass = verifyPass;
    $scope.getActiveCoins = getActiveCoins;
    $scope.$on('$destroy', destroy);

    isCoinSelected();
    var pageTitle;
    angular.element(document.body).removeClass('auth-orange-gradient');

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

    function pastPassphraseWord() {
      $scope.buttonCreateAccount = true;
      $scope.passPhraseText = $storage.passphrase;
    }

    function addAccount() {
      $scope.$localStorage.passphrase = '';
      var coinKeys = Object.keys($scope.getActiveCoins()),
          selectedCoindToEncrypt = $scope.getActiveCoins()[coinKeys[0]].coinId;

      if ($scope.passPhraseText.length) {
        $api.walletEncrypt($scope.passPhraseText, selectedCoindToEncrypt)
        .then(onResolve, onReject);
      } else {
        $message.ngPrepMessageModal(
          $filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'),
          'red'
        );
      }

      function onResolve() {
        $message.ngPrepMessageModal(
          selectedCoindToEncrypt + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'),
          'green'
        );

        $state.go('login');
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

      if ($scope.activeCoins[Object.keys($scope.activeCoins)[0]]) {
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
      $storage['passphrase'] = '';
      $storage['iguana-login-active-coin'] = {};
      $storage['iguana-active-coin'] = {};
    }
  }
]);