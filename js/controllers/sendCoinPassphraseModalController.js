'use strict';

angular.module('IguanaGUIApp')
.controller('sendCoinPassphraseModalController', [
  '$scope',
  '$uibModalInstance',
  '$auth',
  'util',
  '$storage',
  function($scope, $uibModalInstance, $auth, util, $storage) {
    $scope.loggedinCoins = $storage['dashboard-logged-in-coins'];
    $scope.activeCoin = util.getActiveCoin();
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