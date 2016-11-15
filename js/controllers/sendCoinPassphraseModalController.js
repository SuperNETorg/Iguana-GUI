'use strict';

angular.module('IguanaGUIApp')
.controller('sendCoinPassphraseModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  '$storage',
  '$api',
  '$uibModal',
  'receivedObject',
  '$filter',
  '$message',
  function ($scope, $uibModalInstance, util, $storage, $api, $uibModal, receivedObject, $filter, $message) {
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    // dev only
    if (dev.isDev && dev.coinPW.coind[$scope.activeCoin]) $scope.passphrase = dev.coinPW.coind[$scope.activeCoin];

    $scope.confirmSendCoinPassphrase = function () {
      console.log($scope.passphrase);
      $api.walletLogin(
        $scope.passphrase,
        settings.defaultSessionLifetime,
        $scope.activeCoin,
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
          $uibModalInstance.close(true);
        }
      }
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    }
  }
]);