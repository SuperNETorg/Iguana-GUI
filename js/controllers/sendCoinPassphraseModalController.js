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
  '$auth',
  function($scope, $uibModalInstance, util, $storage, $api, $uibModal, receivedObject, $filter, $message, $auth) {
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    // dev only
    if (dev && dev.isDev && dev.coinPW && dev.coinPW.coind[$scope.activeCoin]) $scope.passphrase = dev.coinPW.coind[$scope.activeCoin];

    $scope.confirmSendCoinPassphrase = function() {
      var authActiveCoinArray = [],
          authActiveCoinObj = [];

      authActiveCoinArray[0] = $scope.activeCoin;
      authActiveCoinObj[0] = {
        id: $scope.activeCoin.toUpperCase(),
        coinId: $scope.activeCoin
      };

      $auth.login(
        authActiveCoinArray,
        authActiveCoinObj,
        $scope.passphrase
      )
      .then(function(response) {
        $uibModalInstance.close(true);
      }, function(reason) {
        console.log('request failed: ' + reason);
      });
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    }
  }
]);