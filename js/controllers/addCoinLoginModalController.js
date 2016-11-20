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
  function ($scope, $uibModalInstance, util, $storage, $state, $api, $uibModal, receivedObject, $filter, vars, $rootScope, $auth) {
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
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal-container')),
          resolve: {
            receivedObject: function () {
              return {
                receivedObject: $scope.receivedObject
              };
            },
          }
        });

        modalInstance.result.then(resultPromise, resultPromise);

        function resultPromise(data) {
          if (data && data !== 'backdrop click') {
            $scope.availableCoins = data[0];
            $scope.coinsSelectedToAdd = data[1];
            $scope.receivedObject = data[2];
            console.log($storage);

            if (data[2].length) {
              $scope.passphrase = $storage['iguana-login-active-coin'][0][data[2][0]];
            }
          }
        }
      };

      $scope.login = function() {
        $auth.login(
          $scope.receivedObject,
          $scope.coinsSelectedToAdd,
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
    }

    $scope.$on('$destroy', function() {
      util.bodyBlurOff();
    });
  }
]);