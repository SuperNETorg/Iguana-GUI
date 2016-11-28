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
           $api, $rootScope, $uibModal, $filter, $message, vars, $rates) {

    $scope.util = util;
    $scope.$state = $state;
    $scope.passphraseCheckbox = false;
    $scope.buttonCreateAccount = false;
    $scope.$localStorage = $storage;
    $scope.coins = [];
    $scope.copyPassphraseWord = copyPassphraseWord;
    $scope.pastPassphraseWord = pastPassphraseWord;
    $scope.addAccount = addAccount;
    $scope.verifyPass = verifyPass;
    $scope.activeCoins = $storage['iguana-login-active-coin'] || [];
    $scope.passphraseCount = $storage['isIguana'] ? 24 : 12;
    $storage['iguana-login-active-coin'] = {};

    if (!vars.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      initPage();

      $scope.selectWallet = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          templateUrl: 'partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.coin-select-modal'))
        });

        modalInstance.result.then(function(data) {
          $scope.coins = data;
        });
      };

      $scope.getActiveCoins = function() {
        return $storage['iguana-login-active-coin'];
      };
    }

    function initPage() {
      if ($state.current.name === 'signup.step1') {
        $scope.passphrase = $passPhraseGenerator.generatePassPhrase($storage['isIguana'] ? 8 : 4);
        $storage.passphrase = $scope.passphrase;
      }
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
          addCoinCreateWalletModalClassName = 'add-coin-create-wallet-form',
          selectedCoindToEncrypt = $scope.getActiveCoins()[coinKeys[0]].coinId;

      if ($scope.passPhraseText.length) {
        $api.walletEncrypt($scope.passPhraseText, selectedCoindToEncrypt)
        .then(function() {
          $message.ngPrepMessageModal(
            selectedCoindToEncrypt + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'),
            'green'
          );

          $state.go('login');
        }, function(response) {
          if (response === -15) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'),
              'red'
            );

            $state.go('login');
          }
        });
      } else {
        $message.ngPrepMessageModal(
          $filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'),
          'red'
        );
      }
    }

    function verifyPass() {
      $scope.buttonCreateAccount = false;
    }

    $scope.isDisabled = function() {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }

      return Object.keys($storage['iguana-login-active-coin']).length === 0;
    };

    $scope.$on('$destroy', function iVeBeenDismissed() {
      $storage['passphrase'] = '';
    });
  }
]);