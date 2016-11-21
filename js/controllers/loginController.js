'use strict';

angular.module('IguanaGUIApp')
.controller('loginController', [
  '$scope',
  '$http',
  '$state',
  'util',
  '$auth',
  '$log',
  '$uibModal',
  '$api',
  '$storage',
  '$timeout',
  '$rootScope',
  '$filter',
  '$message',
  'vars',
  function ($scope, $http, $state, util, $auth, $log, $uibModal, $api, $storage,
            $timeout, $rootScope, $filter, $message, vars) {

    $scope.util = util;
    $scope.$auth = $auth;
    $scope.$state = $state;
    $scope.isIguana = $storage['isIguana'];
    $scope.$log = $log;
    $scope.passphraseModel = '';
    $scope.addedCoinsOutput = '';
    $scope.failedCoinsOutput = '';
    $scope.dev = dev;
    $scope.coinsSelectedToAdd = [];
    $scope.$modalInstance = {};
    $scope.coinResponses = [];
    $scope.availableCoins = [];

    $storage['iguana-login-active-coin'] = [];
    $storage['iguana-active-coin'] = {};

    if (!vars.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
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
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal')),
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

            if (data[2].length) {
              $scope.passphraseModel = $storage['iguana-login-active-coin'][0][data[2][0]];
            }
          }
        }
      };

      $scope.login = function() {
        $auth.login(
          $scope.receivedObject,
          $scope.coinsSelectedToAdd,
          $scope.passphraseModel
        );
      };
    }

    $scope.$on('$destroy', function () {
      $storage['iguana-login-active-coin'] = [];
      $storage['iguana-active-coin'] = {};
    })
  }
]);