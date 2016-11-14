'use strict';
angular.module('IguanaGUIApp')
  .controller('loginController', [
    '$scope',
    '$http',
    '$state',
    'util',
    '$log',
    '$uibModal',
    '$api',
    '$storage',
    '$timeout',
    '$rootScope',
    '$filter',
    '$message',
    'vars',
    function ($scope, $http, $state, util, $log, $uibModal, $api, $storage,
              $timeout, $rootScope, $filter, $message, vars) {
      $scope.util = util;
      $scope.$state = $state;
      $scope.isIguana = $storage['isIguana'];
      $scope.$log = $log;
      $scope.passphraseModel = '';
      $scope.dev = dev;
      $scope.coinsSelectedToAdd = [];
      $scope.$modalInstance = {};
      $scope.receivedObject = undefined;
      $scope.availableCoins = util.constructCoinRepeater(vars.coinsInfo);
      $scope.openAddCoinModal = function () {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          //TODO: this original
          // templateUrl: '/partials/add-coin.html',
          templateUrl: '/Iguana-GUI/partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal')),
          resolve: {
            receivedObject: function () {
              return {
                receivedObject: $scope.receivedObject
              };
            },
            // {}
          }
        });
        modalInstance.result.then(function (receivedObject) {
          var coinId,
            availableCoin;
          $scope.coinsSelectedToAdd = [];
          $scope.receivedObject = $storage['iguana-login-active-coin'];
          for (var i = 0; $scope.receivedObject.length > i; i++) {
            coinId = $scope.receivedObject[i];
            for (var l = 0; $scope.availableCoins.length > l; l++) {
              availableCoin = $scope.availableCoins[l];
              if (Object.keys(coinId).indexOf(availableCoin.coinId) != -1) {
                debugger;
                $scope.coinsSelectedToAdd.push(availableCoin);
              }
            }
          }
        });
      };
      $scope.login = function () {
        var coinsSelectedToAdd = util.reindexAssocArray($scope.coinsSelectedToAdd);
        $api.walletLock(coinsSelectedToAdd[0].coinId);
        $api.walletLogin(
          $scope.passphraseModel,
          settings.defaultSessionLifetime,
          coinsSelectedToAdd[0].coinId,
          walletLoginThen
        );
        function walletLoginThen(walletLogin) {
          if (walletLogin === -14 || walletLogin === false) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.WRONG_PASSPHRASE'),
              'red',
              true);
          } else if (walletLogin === -15) {
            $message.ngPrepMessageModal(
              $filter('lang')('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'),
              'red',
              true
            );
          } else {
            $storage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = {'logged': 'yes'};
            $storage['iguana-auth'] = {'timestamp': Date.now()};
            $timeout(function () {
              $state.go('dashboard.main');
            }, 250);
          }
        }
      };
    }]);