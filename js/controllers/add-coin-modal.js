/* Iguana/services/bootstrap */
var app = angular.module('IguanaGUIApp.controllers');

app.controller('ModalController', ['$scope', '$uibModalInstance', 'helper', 'receivedObject',  function ($scope, $uibModalInstance, helper, coinsSelectedToAdd) {
  $scope.isIguana = isIguana;
  $scope.open = open;
  $scope.close = close;
  $scope.next = next;
  $scope.alouNext = false;
  $scope.availableCoins = helper.constructCoinRepeater();
  $scope.helper = helper;
  $scope.clickOnCoin = clickOnCoin;
  $scope.coinSearchModel = undefined;
  $scope.coinsSelectedToAdd = coinsSelectedToAdd || [];

  function clickOnCoin(item, $event) {
    var coinDomElement = angular.element($event.currentTarget), isDisable = false;
    $scope.coinsSelectedToAdd.filter(function (el, id) {
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
  }
  function close() {
    $uibModalInstance.dismiss($scope.coinsSelectedToAdd);
  }
  function next() {
    var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);
    // dev only
    if (dev.isDev && !isIguana && dev.coinPW.coind[coinsSelectedToAdd[0]])
      $scope.passphrase = dev.coinPW.coind[coinsSelectedToAdd[0]];
    if (dev.isDev && isIguana && dev.coinPW.iguana)
      $scope.passphrase = dev.coinPW.iguana;
    $uibModalInstance.close($scope.coinsSelectedToAdd);
  }
}]);


