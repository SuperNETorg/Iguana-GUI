/* Iguana/services/bootstrap */
var app = angular.module('IguanaGUIApp.controllers');

app.controller('addCoinModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  '$localStorage',
  function ($scope, $uibModalInstance, util, $localStorage, $rootScope,receivedObject) {
    $scope.isIguana = $localStorage['isIguana'];
    $scope.open = open;
    $scope.close = close;
    $scope.next = next;
    $scope.alouNext = false;
    $scope.availableCoins = receivedObject.coins;
    $scope.util = util;
    $scope.clickOnCoin = clickOnCoin;
    $scope.coinSearchModel = undefined;
    $scope.coinsSelectedToAdd = $localStorage['iguana-login-active-coin'] || [];

    $scope.coinsSelectedFilter = function (item) {
      var el;
      if (!$scope.coinsSelectedToAdd.coins.length) {
        return false;
      }
      for (var i = 0; $scope.coinsSelectedToAdd.coins.length > i; i++) {
        el = $scope.coinsSelectedToAdd.coins[i];
        if (Object.keys(el)[0] == item) {
          return true;
        } else {
          return false;
        }
      }

    };

    function clickOnCoin(item, $event) {
      var coinDomElement = angular.element($event.currentTarget),
          isDisable = false,
          activeCoinStorageData = {};

      $scope.coinsSelectedToAdd.coins.map(function (el, id) {
        if (el == item.coinId) {
          $scope.coinsSelectedToAdd.coins.splice(id, 1);
          coinDomElement.removeClass('active');
          isDisable = true;
        }
      });

      if (!$localStorage['isIguana']) {
        $scope.coinsSelectedToAdd = []
      }
      if (!isDisable && $scope.coinsSelectedToAdd.coins.indexOf(item.coinId) == -1) {
        $scope.coinsSelectedToAdd.coins.push(item.coinId);
        coinDomElement.addClass('active');
      }
      if (!$localStorage['iguana-login-active-coin']) {
        $localStorage['iguana-login-active-coin'] = [];
      } else {
        $localStorage['iguana-login-active-coin'].map(function (el, id) {
          if (Object.keys(el)[0] == item.coinId) {
            $localStorage['iguana-login-active-coin'].splice(id, 1);
          }
        });
      }

      activeCoinStorageData[$scope.coinsSelectedToAdd.coins[0]] = '';

      // dev only
      if (dev.isDev && !isIguana && dev.coinPW.coind[$scope.coinsSelectedToAdd.coins[0]]) {
        activeCoinStorageData[$scope.coinsSelectedToAdd.coins[0]] =
          dev.coinPW.coind[$scope.coinsSelectedToAdd.coins[0]];
      }
      if (dev.isDev && isIguana && dev.coinPW.iguana) {
        activeCoinStorageData[$scope.coinsSelectedToAdd.coins[0]] = dev.coinPW.iguana;
      }

      if (!isDisable && $localStorage['iguana-login-active-coin'].indexOf(activeCoinStorageData) == -1) {
        $localStorage['iguana-login-active-coin'].push(activeCoinStorageData)
      }
    }

    function close() {
      $uibModalInstance.dismiss();
    }
    function next() {

      $uibModalInstance.close();
    }
  }]);