/* Iguana/services/bootstrap */
'use strict';
angular.module('IguanaGUIApp')
  .controller('addCoinModalController', [
    '$scope',
    '$state',
    '$uibModalInstance',
    'util',
    '$api',
    '$storage',
    '$rootScope',
    '$timeout',
    'vars',
    '$filter',
    '$message',
    '$q',
    function ($scope, $state, $uibModalInstance, util, $api, $storage,
              $rootScope, $timeout, vars) {
      $scope.isIguana = $storage['isIguana'];
      $scope.open = open;
      $scope.close = close;
      $scope.next = next;
      $scope.alouNext = false;
      $scope.util = util;
      $scope.clickOnCoin = clickOnCoin;
      $scope.coinSearchModel = undefined;
      $scope.coinsSelectedToAdd = getSelectedCoins();
      $scope.availableCoins = constructCoinRepeater(vars.coinsInfo);

      function getSelectedCoins() {

        var result = [];

        if ($storage['iguana-login-active-coin']) {
          $storage['iguana-login-active-coin'].map(function (el) {
            result.push(Object.keys(el)[0]);
          });
        }
        return result;
      }

      function constructCoinRepeater(coinsInfo) {
        var index = 0,
          addCoinArray = [],
          coinColors = [
            'orange',
            'breeze',
            'light-blue',
            'yellow'
          ];

        if (undefined !== coinsInfo) {
          for (var key in supportedCoinsList) {
            if (( !$storage['iguana-' + key + '-passphrase'] || (
              $storage['iguana-' + key + '-passphrase'] &&
              $storage['iguana-' + key + '-passphrase'].logged !== 'yes' ))) {
              if (($storage['isIguana'] && coinsInfo[key].iguana === true) ||
                (!$storage['isIguana'] && coinsInfo[key].connection === true)
              ) {
                addCoinArray.push({
                  'id': key.toUpperCase(),
                  'coinId': key.toLowerCase(),
                  'name': supportedCoinsList[key].name,
                  'color': coinColors[index]
                });
                if (index === coinColors.length - 1) {
                  index = 0;
                } else {
                  index++;
                }
              }
            }
          }
        }

        return addCoinArray;
      }

      function clickOnCoin(item, $event) {
        var coinElement = angular.element($event.currentTarget),
          isDisable = false,
          activeCoinStorageData = {};

        $scope.coinsSelectedToAdd.map(function (el, id) {
          if (el == item.coinId) {
            $scope.coinsSelectedToAdd.splice(id, 1);
            coinElement.removeClass('active');
            isDisable = true;
          }
        });

        if (!$storage['isIguana'] || ($storage['isIguana'] && $state.$current.url == '/signup')) {
          $scope.coinsSelectedToAdd = [];
          $storage['iguana-login-active-coin'] = [];
        }

        if (!isDisable && !$scope.coinsSelectedToAdd[item.coinId]) {
          $scope.coinsSelectedToAdd.push(item.coinId);
          coinElement.addClass('active');
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
        activeCoinStorageData[$scope.coinsSelectedToAdd[$scope.coinsSelectedToAdd.length - 1]] = '';
        // dev only
        if (dev.isDev && !$scope.isIguana && dev.coinPW.coind[$scope.coinsSelectedToAdd[0]]) {
          activeCoinStorageData[$scope.coinsSelectedToAdd[$scope.coinsSelectedToAdd.length - 1]] =
            dev.coinPW.coind[$scope.coinsSelectedToAdd[$scope.coinsSelectedToAdd.length - 1]];
        }

        if (dev.isDev && $scope.isIguana && dev.coinPW.iguana) {
          activeCoinStorageData[$scope.coinsSelectedToAdd[$scope.coinsSelectedToAdd.length - 1]] = dev.coinPW.iguana;
        }

        if (!isDisable && $storage['iguana-login-active-coin'].indexOf(activeCoinStorageData) == -1) {
          $storage['iguana-login-active-coin'].push(activeCoinStorageData);
        }
      }

      function close() {
        var coinsSelectedToAdd = closeCallback();
        $uibModalInstance.dismiss([
          constructCoinRepeater(vars.coinsInfo),
          coinsSelectedToAdd,
          getSelectedCoins($scope.receivedObject)
        ]);
      }

      function next() {
        var coinsSelectedToAdd = closeCallback();
        $uibModalInstance.close([
          constructCoinRepeater(vars.coinsInfo),
          coinsSelectedToAdd,
          getSelectedCoins($scope.receivedObject)
        ]);
      }

      function closeCallback() {
        var coinId,
          availableCoin,
          coinsSelectedToAdd = [];
        $scope.receivedObject = $storage['iguana-login-active-coin'];
        for (var i = 0; $scope.receivedObject.length > i; i++) {
          coinId = $scope.receivedObject[i];
          for (var l = 0; $scope.availableCoins.length > l; l++) {
            availableCoin = $scope.availableCoins[l];

            if (Object.keys(coinId).indexOf(availableCoin.coinId) != -1) {
              coinsSelectedToAdd.push(availableCoin);
              $storage.coinsSelectedToAdd = coinsSelectedToAdd;
            }
          }
        }
        return coinsSelectedToAdd;
      }
    }
  ]);