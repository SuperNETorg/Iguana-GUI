/* Iguana/services/bootstrap */
'use strict';

angular.module('IguanaGUIApp')
.controller('selectCoinModalController', [
  '$scope',
  '$state',
  '$uibModal',
  '$uibModalInstance',
  '$api',
  '$storage',
  '$rootScope',
  '$timeout',
  'vars',
  'type',
  'modal',
  function($scope, $state, $uibModal, $uibModalInstance, $api, $storage,
            $rootScope, $timeout, vars, type, modal) {

    $scope.isIguana = $storage.isIguana;
    $scope.coinSearchModel = undefined;
    $scope.coinColors = [
      'orange',
      'breeze',
      'light-blue',
      'yellow'
    ];
    $storage['iguana-login-active-coin'] = {};

    $scope.back = back;
    $scope.close = close;
    $scope.clickOnCoin = clickOnCoin;
    $scope.isCoinsConnected = isCoinsConnected;
    $scope.isAppSetuped = isAppSetuped;
    $scope.getType = getType;
    $scope.type = type;
    $scope.modal = modal;

    $scope.coins = constructCoinRepeater();
    $scope.selectedCoins = getSelectedCoins();

    $scope.karma = { // tests
      getPassphrase: getPassphrase,
      getSelectedCoins: getSelectedCoins,
      constructCoinRepeater: constructCoinRepeater
    };

    $scope.isActive = function(item) {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }

      return $storage['iguana-login-active-coin'][item.coinId];
    };

    $scope.isDisabled = function() {
      return Object.keys($storage['iguana-login-active-coin']).length == 0;
    };

    function getCCoins() {
      return $storage['connected-coins'];
    }

    function isCoinsConnected() {
      return Object.keys(getCCoins()).length > 0;
    }

    function isAppSetuped() {
      return $storage.isAppSetuped && isCoinsConnected();
    }

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

    function getType() {
      return $scope.type;
    }

    function constructCoinRepeater() {
      var index = 0,
          coinsArray = [],
          coinsInfo = vars.coinsInfo;

      if (coinsInfo) {
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
              ($storage.isIguana && coinsInfo[key] && coinsInfo[key].iguana === true) ||
              (
                !$storage.isIguana &&
                (coinsInfo[key] &&
                  coinsInfo[key].connection === true ||
                  (dev && dev.isDev && dev.showAllCoindCoins)
                )
              )
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

      if (!coinElement.hasClass('active') && !$storage.isIguana) {
        $scope.selectedCoins = [];
        $storage['iguana-login-active-coin'] = {};
      }

      if (!$storage['iguana-login-active-coin'] && !$storage.isIguana) {
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

      if (!$storage.isIguana)
        $uibModalInstance.close(constructCoinRepeater());
    }

    function back() {
      if (isAppSetuped()) {
        $state.go('login');
      } else {
        openFlowModal(getType());
      }

      close();
    }

    function close() {
      $uibModalInstance.dismiss(constructCoinRepeater());
    }

    function getPassphrase(coinId) {
      if (dev && dev.coinPW) {
        return ($scope.isIguana && dev.coinPW.iguana ? dev.coinPW.iguana :
          (dev.coinPW.coind[coinId] ? dev.coinPW.coind[coinId] : ''));
      } else {
        return '';
      }
    }

    function openFlowModal(type) {
      $scope.modal.flowModal.appendTo = angular.element(document.querySelector('.flow-modal'));
      $scope.modal.flowModal.resolve = {
        'type': function() {
          return type;
        },
        'modal': function() {
          return $scope.modal;
        }
      };
      var modalInstance = $uibModal.open($scope.modal.flowModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {

      }
    }

    $scope.$on('$destroy', function() {
      delete $rootScope.$$listeners['modal.dismissed'];
    });
  }
]);