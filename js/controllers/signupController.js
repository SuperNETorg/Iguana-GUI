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
  function($scope, $http, $state, util, $passPhraseGenerator, $storage,
           $api, $rootScope, $uibModal, $filter, $message, vars) {

    $scope.util = util;
    $scope.$state = $state;
    $scope.passphraseCheckbox = false;
    $scope.buttonCreateAccount = false;
    $scope.$localStorage = $storage;
    $scope.availableCoins = [];
    $scope.copyPassphraseWord = copyPassphraseWord;
    $scope.pastPassphraseWord = pastPassphraseWord;
    $scope.addAccount = addAccount;
    $scope.verifyPass = verifyPass;
    $scope.coinsSelectedToAdd = [];

    if (!vars.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit(null, vars.coinsInfo);
    }

    function onInit() {
      initPage();

      $scope.selectWallet = function () {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          template: '<div ng-include="\'partials/add-coin.html\'"></div>',
          appendTo: angular.element(document.querySelector('.coin-select-modal')),
          resolve: {
            receivedObject: function () {
              return {
                receivedObject:$scope.receivedObject
              };
            },
            // {}
          }
        });

        modalInstance.result.then(function (receivedObject) {
          var coinId,
              availableCoin;

          $scope.receivedObject = $storage['iguana-login-active-coin'];

          for (var i = 0; $scope.receivedObject.length > i; i++) {
            coinId = $scope.receivedObject[i];

            for (var l = 0; receivedObject.length > l; l++) {
              availableCoin = receivedObject[l];

              if (Object.keys(coinId).indexOf(availableCoin.coinId) != -1) {
                $scope.coinsSelectedToAdd.push(availableCoin);
                $storage.coinsSelectedToAdd = $scope.coinsSelectedToAdd;
              }
            }
          }
        });
      };
    }

    function initPage() {
      if ($state.current.name === 'signup.step1') {
        $scope.passphrase = $passPhraseGenerator.generatePassPhrase($storage['isIguana'] ? 8 : 4);
        $storage.passphrase = $scope.passphrase;
      }
    }

    function copyPassphraseWord($event) {
      $scope.util.addCopyToClipboardFromElement(
        angular.element($event.target),
        $filter('lang')('LOGIN.PASSPHRASE')
      );
    }

    function pastPassphraseWord() {
      $scope.buttonCreateAccount = true;
      $scope.passPhraseText = $storage.passphrase;
    }

    function addAccount() {
      $scope.$localStorage.passphrase = '';
      var addCoinCreateWalletModalClassName = 'add-coin-create-wallet-form';

      // if (coinsSelectedToAdd[0]) selectedCoindToEncrypt = coinsSelectedToAdd[0]; //todo receive from login controller
      var selectedCoindToEncrypt = $storage.coinsSelectedToAdd[0]['coinId'];

      if ($scope.passPhraseText !== '') {
        var walletEncryptResponse = $api.walletEncrypt($scope.passPhraseText, selectedCoindToEncrypt);

        if (walletEncryptResponse !== -15) {
          $message.ngPrepMessageModal(selectedCoindToEncrypt + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'), 'green', true);
          if ($state.current.name === 'dashboard') {
            util.toggleModalWindow(addCoinCreateWalletModalClassName, 300); //todo change in the future
          } else {
            $state.go('login');
          }
        } else {
          $message.ngPrepMessageModal($filter('lang')('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'), 'red', true);
          if ($state.current.name === 'dashboard') {
            util.toggleModalWindow(addCoinCreateWalletModalClassName, 300);//todo change in the future
          }
        }
      } else {
        $message.ngPrepMessageModal($filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'), 'red', true);
      }
    }

    function verifyPass() {
      $scope.buttonCreateAccount = false;
    }
  }
]);