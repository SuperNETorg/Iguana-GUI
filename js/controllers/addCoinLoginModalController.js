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
  'type',
  function($scope, $uibModalInstance, util, $storage, $state, $api,
           $uibModal, receivedObject, $filter, vars, $rootScope, $auth, type) {

    var pageTitle;

    $scope.step = 'login';
    $storage['iguana-active-coin'] = {};
    $scope.util = util;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.isChanged = false;
    $scope.$auth = $auth;
    $scope.isIguana = $storage.isIguana;
    $scope.passphraseModel = '';
    $scope.addedCoinsOutput = '';
    $scope.failedCoinsOutput = '';
    $scope.$modalInstance = {};
    $scope.coinResponses = [];
    $scope.coins = [];
    $scope.activeCoins = $storage['iguana-login-active-coin'] || {};
    $storage['iguana-active-coin'] = {};
    $scope.messages = '';
    $scope.loginActiveCoin = '';
    $scope.title = setTitle;
    $scope.type = type;
    $scope.login = login;
    $scope.setIsChanged = isChanged;
    $scope.isCoinSelected = isCoinSelected;
    $scope.getActiveCoins = getActiveCoins;
    $scope.openLoginCoinModal = openLoginCoinModal;
    $scope.openSignupCoinModal = openSignupCoinModal;
    $scope.karma = { // test
      setTitle: setTitle
    };

    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    // TODO: will be removed
    function onInit() {
      $scope.coins = [];
    }

    var selectCoinModal = {
      animation: true,
      ariaLabelledBy: 'modal-title',
      size: 'full',
      ariaDescribedBy: 'modal-body',
      controller: 'selectCoinModalController',
      templateUrl: 'partials/add-coin.html',
      appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
    };

    function getActiveCoins() {
      return $storage['iguana-login-active-coin'];
    }

    function isCoinSelected() {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }

      return Object.keys($storage['iguana-login-active-coin']).length === 0;
    }

    function openLoginCoinModal() {
      selectCoinModal.resolve = {
        'type': function() {
          return 'login';
        }
      };
      var modalInstance = $uibModal.open(selectCoinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {
        var coinKeys = Object.keys($storage['iguana-login-active-coin']);

        $scope.coins = data;
        $scope.passphraseModel = coinKeys.length ? $storage['iguana-login-active-coin'][coinKeys[0]].pass : '';
        $scope.step = 'login.step2';
        //$state.go('login.step2');
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function openSignupCoinModal() {
      $storage['iguana-login-active-coin'] = {};
      $storage['iguana-active-coin'] = {};
      selectCoinModal.resolve = {
        'type': function() {
          return 'signup';
        }
      };
      var modalInstance = $uibModal.open(selectCoinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {
        $scope.loginActiveCoin = $storage['iguana-login-active-coin'];
        //$state.go('signup.step1');
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function login() {
      $auth.login(
        $scope.getActiveCoins(),
        $scope.passphraseModel
      )
      .then(function(response) {
        $uibModalInstance.close(true);
      }, function(reason) {
        console.log('request failed: ' + reason);
      });
    }

    function setTitle() {
      pageTitle = $filter('lang')('LOGIN.LOGIN_TO_WALLET');

      if (
        $storage['iguana-login-active-coin'] &&
        Object.keys($storage['iguana-login-active-coin']).length &&
        $storage['iguana-login-active-coin'][Object.keys($storage['iguana-login-active-coin'])[0]]
      ) {
        pageTitle = pageTitle.replace('{{ coin }}', $storage['iguana-login-active-coin'][Object.keys($storage['iguana-login-active-coin'])[0]].name);
      }

      return pageTitle;
    }

    function isChanged() {
      $scope.messages = $filter('lang')('LOGIN.INCORRECT_INPUT').replace('{{ count }}', $scope.isIguana ? '24' : '12');
      $scope.isChanged = true;
    }

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };
  }
]);