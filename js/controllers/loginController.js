'use strict';

angular.module('IguanaGUIApp')
.controller('loginController', [
  '$scope',
  '$http',
  '$state',
  'util',
  '$auth',
  '$uibModal',
  '$api',
  '$storage',
  '$timeout',
  '$rootScope',
  '$filter',
  '$message',
  'vars',
  function($scope, $http, $state, util, $auth, $uibModal, $api, $storage,
           $timeout, $rootScope, $filter, $message, vars) {
    var pageTitle;

    $storage['iguana-active-coin'] = {};
    $scope.util = util;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.isChanged = false;
    $scope.$auth = $auth;
    $scope.$state = $state;
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
    $rootScope.background = true;
    $scope.title = setTitle;
    $scope.login = login;
    $scope.setIsChanged = isChanged;
    $scope.isCoinSelected = isCoinSelected;
    $scope.getActiveCoins = getActiveCoins;
    $scope.openFlowModal = openFlowModal;
    $scope.karma = { // tests
      setTitle: setTitle,
      stateChangeStart: stateChangeStart
    };
    $scope.$on('$stateChangeStart', stateChangeStart);

    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    if ($state.current.name === 'login.step2') {
      $rootScope.background = false;
    }

    // TODO: will be removed
    function onInit() {
      $scope.coins = [];
    }

    var openFlowModal = {
      animation: true,
      ariaLabelledBy: 'modal-title',
      size: 'full',
      ariaDescribedBy: 'modal-body',
      controller: 'flowModalController',
      templateUrl: 'partials/flow.html',
      appendTo: angular.element(document.querySelector('.flow-modal'))
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

    function stateChangeStart() {
      if ($state.current.name === 'login') {
        $rootScope.background = false;
      } else if ($state.current.name === 'login.step2') {
        $rootScope.background = true;
      }
    }

    function openFlowModal(type) {
      openFlowModal.resolve = {
        'type': function() {
          return type;
        }
      };
      var modalInstance = $uibModal.open(openFlowModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {

      }
    }

    function login() {
      $auth.login(
        $scope.getActiveCoins(),
        $scope.passphraseModel
      );
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
  }
]);