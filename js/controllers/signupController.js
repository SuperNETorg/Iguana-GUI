'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('signupController', [
  '$scope',
  '$http',
  '$state',
  'util',
  'passPhraseGenerator',
  '$localStorage',
  'api',
  '$rootScope',
  '$uibModal',
  '$filter',
  function($scope, $http, $state, util, passPhraseGenerator, $localStorage, api, $rootScope, $uibModal, $filter) {
    $scope.util = util;
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
          appendTo: angular.element(document.querySelector('.coin-select-modal')),
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
      $scope.util.addCopyToClipboardFromElement(
        angular.element($event.target),
        $filter('lang')('LOGIN.PASSPHRASE')
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
          util.ngPrepMessageModal(selectedCoindToEncrypt + $filter('lang')('MESSAGE.X_WALLET_IS_CREATED'), 'green', true);
          if ($state.current.name === 'dashboard') {
            util.toggleModalWindow(addCoinCreateWalletModalClassName, 300); //todo change in the future
          } else {
            $state.go('login');
          }
        } else {
          util.ngPrepMessageModal($filter('lang')('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'), 'red', true);
          if ($state.current.name === 'dashboard') {
            util.toggleModalWindow(addCoinCreateWalletModalClassName, 300);//todo change in the future
          }
        }
      } else {
        util.ngPrepMessageModal($filter('lang')('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'), 'red', true);
      }
    }

    function verifyPass() {
      $scope.buttonCreateAccount = false;
    }
  }]);