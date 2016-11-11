'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('signupController', [
  '$scope',
  '$http',
  '$state',
  'helper',
  'passPhraseGenerator',
  '$localStorage',
  'api',
  '$rootScope',
  '$uibModal',
  function($scope, $http, $state, helper, passPhraseGenerator, $localStorage, api, $rootScope,$uibModal) {

    $scope.helper = helper;
    $scope.$state = $state;
    $scope.passphraseCheckbox = false;
    $scope.buttonCreateAccount = false;
    $scope.$localStorage = $localStorage;

    $scope.copyPassphraseWord = copyPassphraseWord;
    $scope.pastPassphraseWord = pastPassphraseWord;
    $scope.addAccount = addAccount;
    $scope.verifyPass = verifyPass;

    $rootScope.$on('getCoin', function ($ev, coins) {
      $scope.availableCoins = helper.constructCoinRepeater(coins);
    });

    initPage();

    $scope.selectWallet = function () {

      if($scope.availableCoins && $scope.availableCoins.length) {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          // templateUrl: '/partials/add-coin.html',
          templateUrl: '/iguana/Iguana-GUI/partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal')),
          resolve: {
            receivedObject: function () {
              return {
                receivedObject:$scope.receivedObject,
                coins:$scope.availableCoins,
              };
            },
            // {}

          }
        });

        modalInstance.result.then(function(receivedObject) {

          var coinId,
            availableCoin;

          if (receivedObject.length > 1) $scope.passphraseModel = receivedObject; // dev
          $scope.coinsSelectedToAdd = [];
          $scope.receivedObject = $localStorage['iguana-login-active-coin'];

          for (var i = 0; $scope.receivedObject.length > i; i++) {
            coinId = $scope.receivedObject[i];

            for (var id in $scope.availableCoins) {
              availableCoin = $scope.availableCoins[id];

              if (availableCoin.coinId == coinId) {
                $scope.coinsSelectedToAdd.push(availableCoin);
              }
            }
          }
        });
      }
    };

    function initPage() {
      if ($state.current.name === 'signup.step1') {
        $scope.passphrase = passPhraseGenerator.generatePassPhrase($localStorage['isIguana'] ? 8 : 4);
        $localStorage.passphrase = $scope.passphrase;
      }
    }

    function copyPassphraseWord($event) {
      $scope.helper.addCopyToClipboardFromElement(
        angular.element($event.target),
        $scope.helper.lang('LOGIN.PASSPHRASE')
      );
    }

    function pastPassphraseWord() {
      $scope.buttonCreateAccount = true;
      $scope.passPhraseText = $localStorage.passphrase;
    }

    function addAccount() {
      $scope.$localStorage.passphrase = '';
      var addCoinCreateWalletModalClassName = 'add-coin-create-wallet-form';

      // if (coinsSelectedToAdd[0]) selectedCoindToEncrypt = coinsSelectedToAdd[0]; //todo receive from login controller
      // var selectedCoindToEncrypt = 'mzc';

      if ($scope.passPhraseText !== '') {
        var walletEncryptResponse = api.walletEncrypt($scope.passPhraseText, selectedCoindToEncrypt);

        if (walletEncryptResponse !== -15) {
          helper.ngPrepMessageModal(selectedCoindToEncrypt + helper.lang('MESSAGE.X_WALLET_IS_CREATED'), 'green', true);
          if ($state.current.name === 'dashboard') {
            helper.toggleModalWindow(addCoinCreateWalletModalClassName, 300); //todo change in the future
          } else {
            $state.go('login');
          }
        } else {
          helper.ngPrepMessageModal(helper.lang('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'), 'red', true);
          if ($state.current.name === 'dashboard') {
            helper.toggleModalWindow(addCoinCreateWalletModalClassName, 300);//todo change in the future
          }
        }
      } else {
        helper.ngPrepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'), 'red', true);
      }
    }

    function verifyPass() {
      $scope.buttonCreateAccount = false;
    }
  }]);