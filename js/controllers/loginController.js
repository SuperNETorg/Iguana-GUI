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
    $storage['iguana-active-coin'] = {};
    $scope.errPassphrase = '';
    $scope.loginActiveCoin = '';
    $scope.clearMessage = clearMessage;
    $scope.title = setTitle;

    angular.element(document.body).addClass('auth-orange-gradient');
    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    if($state.current.name =='login.step2') {
      angular.element(document.body).removeClass('auth-orange-gradient');
    }

    function onInit() {
      $scope.coins = [];
      $scope.openLoginCoinModal = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          size: 'full',
          ariaDescribedBy: 'modal-body',
          controller: 'loginSelectCoinModalController',
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
          $scope.loginActiveCoin = $storage['iguana-login-active-coin'];
          $state.go('signup.step1');
        })
      };

      $scope.login = function() {
        $auth.login(
          $scope.getActiveCoins(),
          $scope.passphraseModel
        ).then(function(resolve) {

        }, function(reject) {
          if (reject[2] == 'MESSAGE.INCORRECT_INPUT_P3') {
            $scope.errPassphrase = reject[2];
            document.getElementById('passphrase').value = '';
          }
        });
      };

      $scope.getActiveCoins = function() {
        return $storage['iguana-login-active-coin'];
      };
    }

    $scope.isCoinSelected = function() {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }
      return Object.keys($storage['iguana-login-active-coin']).length === 0;
    };

    $scope.$on("$stateChangeStart",
      function() {
        if ($state.current.name === 'login') {
          angular.element(document.body).removeClass('auth-orange-gradient');
        } else if ($state.current.name === 'login.step2') {
          $scope.errPassphrase ='';
          angular.element(document.body).addClass('auth-orange-gradient');
        }
      });

    function setTitle() {
      return $storage['iguana-login-active-coin'][Object.keys($storage['iguana-login-active-coin'])[0]] ?
        $storage['iguana-login-active-coin'][Object.keys($storage['iguana-login-active-coin'])[0]]['name'] : '';
    }

    function clearMessage() {
      $scope.errPassphrase = '';
    }
  }
]);