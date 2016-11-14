/* Iguana/services/bootstrap */
'use strict';
angular.module('IguanaGUIApp')
  .controller('addCoinModalController', [
    '$scope',
    '$uibModalInstance',
    'util',
    '$storage',
    '$rootScope',
    'vars',
    function ($scope, $uibModalInstance, util, $storage, $rootScope, vars, receivedObject) {
      $scope.isIguana = $storage['isIguana'];
      $scope.open = open;
      $scope.close = close;
      $scope.next = next;
      $scope.alouNext = false;
      $scope.util = util;
      $scope.clickOnCoin = clickOnCoin;
      $scope.coinSearchModel = undefined;
      $scope.coinsSelectedToAdd = {coins: $storage['iguana-login-active-coin'] || []};
      $scope.availableCoins = util.constructCoinRepeater(vars.coinsInfo);
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
        if (!$storage['isIguana']) {
          $scope.coinsSelectedToAdd.coins = [];
        }
        if (!isDisable && !$scope.coinsSelectedToAdd.coins[item.coinId]) {
          $scope.coinsSelectedToAdd.coins.push(item.coinId);
          coinDomElement.addClass('active');
        }
        if (!$storage['iguana-login-active-coin']) {
          $storage['iguana-login-active-coin'] = [];
        } else {
          $storage['iguana-login-active-coin'].map(function (el, id) {
            if (Object.keys(el)[0] == item.coinId) {
              $storage['iguana-login-active-coin'].splice(id, 1);
            }
          });
        }
        activeCoinStorageData[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]] = '';
        // dev only
        if (dev.isDev && !$scope.isIguana && dev.coinPW.coind[$scope.coinsSelectedToAdd.coins[0]]) {
          activeCoinStorageData[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]] =
            dev.coinPW.coind[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]];
        }
        if (dev.isDev && $scope.isIguana && dev.coinPW.iguana) {
          activeCoinStorageData[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]] = dev.coinPW.iguana;
        }
        if (!isDisable && $storage['iguana-login-active-coin'].indexOf(activeCoinStorageData) == -1) {
          $storage['iguana-login-active-coin'].push(activeCoinStorageData);
        }
      }

      function close() {
        $uibModalInstance.dismiss();
      }

      function next() {
        $uibModalInstance.close();
      }
    }]);