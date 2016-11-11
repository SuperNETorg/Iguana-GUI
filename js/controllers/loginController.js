'use strict';

angular.module('IguanaGUIApp.controllers')
  .controller(
    'loginController',
    [
      '$scope',
      '$http',
      '$state',
      'helper',
      '$log',
      '$uibModal',
      'api',
      '$localStorage',
      '$timeout',
      '$rootScope',
    function ($scope, $http, $state, helper, $log, $uibModal, Api, $localStorage, $timeout,$rootScope) {
      $scope.helper = helper;
      $scope.$state = $state;
      $scope.isIguana = $localStorage['isIguana'];
      $scope.$log = $log;
      $scope.passphraseModel = '';
      $scope.dev = dev;
      $scope.coinsSelectedToAdd = [];
      $scope.$modalInstance = {};
      $scope.receivedObject = undefined;

      $rootScope.$on('getCoin', function ($ev, coins) {
        $scope.availableCoins = helper.constructCoinRepeater(coins);
      });

      $scope.openAddCoinModal = function () {
        if ($scope.availableCoins && $scope.availableCoins.length) {
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

      $scope.login = function () {
        var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);
        Api.walletLock(coinsSelectedToAdd[0].coinId);
        Api.walletLogin(
          $scope.passphraseModel,
          settings.defaultSessionLifetime,
          coinsSelectedToAdd[0].coinId,
          walletLoginThen
        );

        function walletLoginThen(walletLogin) {
          if (walletLogin === -14 || walletLogin === false) {
            helper.ngPrepMessageModal(
              helper.lang('MESSAGE.WRONG_PASSPHRASE'),
              'red',
              true);
          } else if (walletLogin === -15) {
            helper.ngPrepMessageModal(
              helper.lang('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'),
              'red',
              true
            );
          } else {
            $localStorage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = { 'logged': 'yes' };
            $localStorage['iguana-auth'] = { 'timestamp': Date.now() };
            $timeout(function() {
              $state.go('dashboard.main');
            }, 250);
          }
        }
      };
    }]);