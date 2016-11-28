'use strict';

angular.module('IguanaGUIApp')
.controller('addCoinLoginModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  '$storage',
  '$state',
  '$api',
  '$uibModal',
  'receivedObject',
  '$filter',
  'vars',
  '$rootScope',
  '$auth',
  function($scope, $uibModalInstance, util, $storage, $state, $api, $uibModal, receivedObject, $filter, vars, $rootScope, $auth) {
    $scope.isIguana = $storage['isIguana'];
    $scope.open = open;
    $scope.close = close;
    $scope.util = util;

    util.bodyBlurOn();

    $scope.$state = $state;
    $scope.passphrase = '';
    $scope.dev = dev;
    $scope.coinsSelectedToAdd = [];
    $scope.$modalInstance = {};
    $scope.receivedObject = undefined;

    $storage['iguana-login-active-coin'] = [];
    $storage['iguana-active-coin'] = {};

    if (!vars.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit(null, vars.coinsInfo);
    }

    function onInit() {
      $scope.availableCoins = [];

      $scope.openAddCoinModal = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          templateUrl: 'partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal-container'))
        });

        modalInstance.result.then(resultPromise);

        $rootScope.$on('modal.dismissed', function(event, coins) {
          resultPromise(coins);
        });

        function resultPromise(data) {
          var coinKeys = Object.keys($storage['iguana-login-active-coin']);

          $scope.coins = data;
          $scope.passphrase = (
            coinKeys.length ?
              $storage['iguana-login-active-coin'][coinKeys[0]].pass :
              ''
          );
        }
      };

      $scope.login = function() {
        $auth.login(
          $scope.getActiveCoins(),
          $scope.passphrase
        )
        .then(function(response) {
          $uibModalInstance.close(true);
        }, function(reason) {
          console.log('request failed: ' + reason);
        });
      };
    }

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };

    $scope.getActiveCoins = function() {
      return $storage['iguana-login-active-coin'];
    };

    $scope.$on('$destroy', function() {
      util.bodyBlurOff();
    });
  }
]);