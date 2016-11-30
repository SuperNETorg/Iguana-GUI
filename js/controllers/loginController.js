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
  function($scope, $http, $state, util, $auth, $log, $uibModal, $api, $storage,
           $timeout, $rootScope, $filter, $message, vars) {
    $storage['iguana-login-active-coin'] = [];
    $storage['iguana-active-coin'] = {};
    $scope.util = util;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.$auth = $auth;
    $scope.$state = $state;
    $scope.isIguana = $storage['isIguana'];
    $scope.$log = $log;
    $scope.passphraseModel = '';
    $scope.addedCoinsOutput = '';
    $scope.failedCoinsOutput = '';
    $scope.dev = dev;
    $scope.$modalInstance = {};
    $scope.coinResponses = [];
    $scope.coins = [];
    $scope.activeCoins = $storage['iguana-login-active-coin'] || [];
    $storage['iguana-login-active-coin'] = {};
    $storage['iguana-active-coin'] = {};
    angular.element(document.body).addClass('auth-orange-gradient');
    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    function onInit() {
      $scope.coins = [];
      $scope.openAddCoinModal = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          templateUrl: 'partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
        });
        modalInstance.result.then(resultPromise);
        $rootScope.$on('modal.dismissed', function(event, coins) {
          resultPromise(coins);
        });
        function resultPromise(data) {
          var coinKeys = Object.keys($storage['iguana-login-active-coin']);
          $scope.coins = data;
          $scope.passphraseModel = coinKeys.length ? $storage['iguana-login-active-coin'][coinKeys[0]].pass : '';
        }
      };
      $scope.openSignupCoinModal = function() {
        $storage['iguana-login-active-coin'] = {};
        $storage['iguana-active-coin'] = {};
        var modalInstance = $uibModal.open({
          animation: true,
          size: 'full',
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'signupSelectCoinModalController',
          templateUrl: 'partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
        });
        modalInstance.result.then(function(data) {
          $state.go('signup.step1');
        })
      };
      $scope.login = function() {
        $auth.login(
          $scope.getActiveCoins(),
          $scope.passphraseModel
        );
      };
      $scope.getActiveCoins = function() {
        return $storage['iguana-login-active-coin'];
      };
    }
    $scope.isDisabled = function() {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }
      return Object.keys($storage['iguana-login-active-coin']).length === 0;
    };
  }
]);