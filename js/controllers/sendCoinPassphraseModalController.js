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
    $scope.loggedinCoins = $storage['dashboard-logged-in-coins'];
    $scope.activeCoin = $storage['iguana-active-coin'] && $storage['iguana-active-coin'].id ? $storage['iguana-active-coin'].id : 0;
    // dev only
    if (dev && dev.isDev && dev.coinPW && dev.coinPW.coind[$scope.activeCoin]) $scope.passphrase = dev.coinPW.coind[$scope.activeCoin];

    $scope.confirmSendCoinPassphrase = function() {
      var authActiveCoinObj = {};

      authActiveCoinObj[$scope.activeCoin]= $scope.loggedinCoins[$scope.activeCoin];

      $auth.login(
        authActiveCoinObj,
        $scope.passphrase,
        true
      )
      .then(function(response) {
        $uibModalInstance.close(true);
      }, function(reason) {
        console.log('request failed: ' + reason);
      });
    };

    $scope.close = function() {
      $uibModalInstance.close();
    }
  }
]);