'use strict';

angular.module('IguanaGUIApp')
.controller('addCoinLoginModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  '$storage',
  '$state',
  '$api',
  '$uibModal',
  'receivedObject',
  '$filter',
  function ($scope, $uibModalInstance, util, $storage, $state, $api, $uibModal, receivedObject, $filter) {
    $scope.isIguana = $storage['isIguana'];
    $scope.open = open;
    $scope.close = close;
    $scope.util = util;

    util.bodyBlurOn();

    $scope.$state = $state;
    $scope.passphrase = '';
    $scope.dev = dev;
    $scope.coinsSelectedToAdd = [];
    $scope.$modalInstance = {};
    $scope.receivedObject = undefined;

    $scope.openAddCoinModal = function () {
      var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'addCoinModalController',
            template: '<div ng-include="\'partials/add-coin.html\'"></div>',
            appendTo: angular.element(document.querySelector('.auth-add-coin-modal-container')),
            resolve: {
              receivedObject: function () {
                return $scope.receivedObject;
              }
            }
          });
      modalInstance.result.then(onDone);

      function onDone(receivedObject) {
        var coinId,
            availableCoin;

        if (receivedObject.length > 1) $scope.passphrase = receivedObject; // dev
        $scope.coinsSelectedToAdd = [];
        $scope.receivedObject = $storage['iguana-login-active-coin'];

        for (var i = 0; $scope.receivedObject.length > i; i++) {
          coinId = $scope.receivedObject[i];

          for (var id in $scope.availableCoins) {
            availableCoin = $scope.availableCoins[id];

            if (availableCoin.coinId == coinId) {
              $scope.coinsSelectedToAdd.push(availableCoin);
            }
          }
        }
      }
    };

    $scope.login = function () {
      var coinsSelectedToAdd = util.reindexAssocArray($scope.coinsSelectedToAdd);

      $api.walletLock(coinsSelectedToAdd[0].coinId);
      $api.walletLogin(
        $scope.passphrase,
        settings.defaultSessionLifetime,
        coinsSelectedToAdd[0].coinId,
        walletLoginThen
      );

      function walletLoginThen(walletLogin) {
        if (walletLogin === -14 || walletLogin === false) {
          util.ngPrepMessageModal(
            $filter('lang')('MESSAGE.WRONG_PASSPHRASE'),
            'red',
            true);
        } else if (walletLogin === -15) {
          util.ngPrepMessageModal(
            $filter('lang')('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'),
            'red',
            true
          );
        } else {
          $uibModalInstance.close(coinsSelectedToAdd[0].coinId);
        }
      }
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    }

    $scope.$on('$destroy', function() {
      util.bodyBlurOff();
    });
  }
]);