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
      $scope.dev = dev;
      $scope.coinsSelectedToAdd = [];
      $scope.$modalInstance = {};
      $scope.receivedObject = undefined;

      if (!vars.coinsInfo) {
        $rootScope.$on('coinsInfo', onInit);
      } else {
        onInit(null, vars.coinsInfo);
      }

      function onInit(event, data) {
        $scope.availableCoins = util.constructCoinRepeater(data);
        $scope.openAddCoinModal = function () {
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'addCoinModalController',
            template: '<div ng-include="\'partials/add-coin.html\'"></div>',
            appendTo: angular.element(document.querySelector('.auth-add-coin-modal')),
            resolve: {
              receivedObject: function () {
                return {
                  receivedObject: $scope.receivedObject
                };
              },
            }
          });
          modalInstance.result.then(function () {
            var coinId,
              availableCoin;
            $scope.coinsSelectedToAdd = [];
            $scope.receivedObject = $storage['iguana-login-active-coin'];
            for (var i = 0; $scope.receivedObject.length > i; i++) {
              coinId = $scope.receivedObject[i];
              for (var l = 0; $scope.availableCoins.length > l; l++) {
                availableCoin = $scope.availableCoins[l];
                if (Object.keys(coinId).indexOf(availableCoin.coinId) != -1) {
                  $scope.coinsSelectedToAdd.push(availableCoin);
                }
              }
            }
          });
        };
      }
    }]);