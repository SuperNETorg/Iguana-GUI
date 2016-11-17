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
    $scope.openAddCoinModal;

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

        modalInstance.result.then(function (data) {
          $scope.availableCoins = data[0];
          $scope.coinsSelectedToAdd = data[1];
          $scope.receivedObject = data[2] ;
          $scope.passphraseModel = $storage['iguana-login-active-coin'][0][data[2][0]];
        });
      };

      $scope.login = function(dd, gg) {
        $auth.login(
          $scope.receivedObject,
          $scope.coinsSelectedToAdd,
          $scope.passphraseModel
        )
      };
    }
  }
]);