/* Iguana/services/bootstrap */
'use strict';

angular.module('IguanaGUIApp')
.controller('loginSelectCoinModalController', [
  '$scope',
  '$state',
  '$uibModalInstance',
  '$api',
  '$storage',
  '$rootScope',
  '$timeout',
  'vars',
  '$filter',
  '$message',
  '$q',
  function($scope, $state, $uibModalInstance, $api, $storage,
            $rootScope, $timeout, vars) {

    $scope.isIguana = $storage['isIguana'];
    $scope.coinSearchModel = undefined;
    $scope.coinColors = [
      'orange',
      'breeze',
      'light-blue',
      'yellow'
    ];
    $storage['iguana-login-active-coin'] = {};

    $scope.open = open;
    $scope.close = close;
    $scope.next = next;
    $scope.clickOnCoin = clickOnCoin;

    $scope.coins = constructCoinRepeater();
    $scope.selectedCoins = getSelectedCoins();

    $scope.isActive = function(item) {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }

      return $storage['iguana-login-active-coin'][item.coinId];
    };

    $scope.isDisabled = function() {
      return Object.keys($storage['iguana-login-active-coin']).length == 0;
    };

    $scope.$on('modal.dismissing', function() {
      $rootScope.$broadcast('modal.dismissed', constructCoinRepeater());
    });

    function getSelectedCoins() {
      var result = {},
          coins = constructCoinRepeater();

      if ($storage['iguana-login-active-coin']) {
        for (var i = 0; coins.length > i; i++) {
          if ($storage['iguana-login-active-coin'][coins[i].coinId]) {
            result[coins[i].coinId] = constructCoinRepeater()[i];
          }
        }
      }

      return result;
    }

    function constructCoinRepeater() {
      var index = 0,
          coinsArray = [],
          coinsInfo = vars.coinsInfo;

      if (undefined !== coinsInfo) {
        for (var key in supportedCoinsList) {
          if (
            (!$storage['iguana-' + key + '-passphrase'] ||
              (
                $storage['iguana-' + key + '-passphrase'] &&
                $storage['iguana-' + key + '-passphrase'].logged !== 'yes'
              )
            )
          ) {
            if (
              ($storage['isIguana'] && coinsInfo[key].iguana === true) ||
              (!$storage['isIguana'] && coinsInfo[key].connection === true)
            ) {
              coinsArray.push({
                'id': key.toUpperCase(),
                'coinId': key.toLowerCase(),
                'name': supportedCoinsList[key].name,
                'color': $scope.coinColors[index]
              });

              if (index === $scope.coinColors.length - 1) {
                index = 0;
              } else {
                index++;
              }
            }
          }
        }
      }

      return coinsArray;
    }

    function clickOnCoin(item, $event) {
      var coinElement = angular.element($event.currentTarget);

      if (!coinElement.hasClass('active')) {
        $scope.selectedCoins = [];
        $storage['iguana-login-active-coin'] = {};
      }

      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }

      if (!$storage['iguana-login-active-coin'][item.coinId]) {
        coinElement.addClass('active');
        item.pass = getPassphrase(item.coinId);
        $storage['iguana-login-active-coin'][item.coinId] = item;
      } else {
        coinElement.removeClass('active');
        delete $storage['iguana-login-active-coin'][item.coinId];
      }

      $scope.selectedCoins = $storage['iguana-login-active-coin'];
      $state.go('login.step2');
      $uibModalInstance.close(constructCoinRepeater());
    }

    function close() {
      $uibModalInstance.dismiss(constructCoinRepeater());
    }

    function next() {
      $uibModalInstance.close(constructCoinRepeater());
    }

    function getPassphrase(coinId) {
      if (dev && dev.coinPW) {
        return ($scope.isIguana && dev.coinPW.iguana ? dev.coinPW.iguana :
          (dev.coinPW.coind[coinId] ? dev.coinPW.coind[coinId] : ''));
      } else {
        return '';
      }
    }

    $scope.$on('$destroy', function() {
      delete $rootScope.$$listeners['modal.dismissed'];
    });
  }
]);