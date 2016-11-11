/* Iguana/services/bootstrap */
var app = angular.module('IguanaGUIApp.controllers');

app.controller('addCoinModalController',
  [
    '$scope',
    '$uibModalInstance',
    'helper',
    'receivedObject',
    '$localStorage',
    '$rootScope',
    'receivedObject',
    function ($scope, $uibModalInstance, helper, coinsSelectedToAdd, $localStorage, $rootScope,receivedObject) {
      $scope.isIguana = $localStorage['isIguana'];
      $scope.open = open;
      $scope.close = close;
      $scope.next = next;
      $scope.alouNext = false;
      $scope.availableCoins = receivedObject.coins;
      $scope.helper = helper;
      $scope.clickOnCoin = clickOnCoin;
      $scope.coinSearchModel = undefined;
      $scope.coinsSelectedToAdd = coinsSelectedToAdd || [];

      function clickOnCoin(item, $event) {
        var coinDomElement = angular.element($event.currentTarget),
            isDisable = false;

        $scope.coinsSelectedToAdd.coins.filter(function (el, id) {
          if (el == item.coinId) {
            $scope.coinsSelectedToAdd.splice(id, 1);
            coinDomElement.removeClass('active');
            isDisable = true;
          }
        });

        if (!isIguana) {
          $scope.coinsSelectedToAdd = []
        }

        if (!isDisable) {
          $scope.coinsSelectedToAdd.push(item.coinId);
          coinDomElement.addClass('active');
        }
        $localStorage['iguana-login-active-coin'] = $scope.coinsSelectedToAdd;
      }

      function close() {
        $localStorage['iguana-login-active-coin'] = [];
        $uibModalInstance.dismiss();
      }

      function next() {
        var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);
        // dev only
        if (dev.isDev && !isIguana && dev.coinPW.coind[coinsSelectedToAdd[0]])
          $scope.passphrase = dev.coinPW.coind[coinsSelectedToAdd[0]];
        if (dev.isDev && isIguana && dev.coinPW.iguana)
          $scope.passphrase = dev.coinPW.iguana;
        $uibModalInstance.close($scope.passphrase);
      }
    }]);


