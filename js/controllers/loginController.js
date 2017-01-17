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
    if (!$rootScope.allowLoginStateChange) $storage['iguana-login-active-coin'] = {};
    $scope.util = util;
    $scope.coinsInfo = vars.coinsInfo;
    $scope.isCoinsConnected = isCoinsConnected;
    $scope.isAppSetup = isAppSetup;
    $scope.isChanged = false;
    $scope.$auth = $auth;
    $scope.$state = $state;
    $scope.$storage = $storage;
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
    $scope.loginCheck = loginCheck;
    $scope.goBack = goBack;
    $scope.setIsChanged = isChanged;
    $scope.isCoinSelected = isCoinSelected;
    $scope.getActiveCoins = getActiveCoins;
    $scope.openFlowModal = openFlowModal;
    $scope.openCoinModal = openCoinModal;
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

    if ($state.current.name === 'login.step2' || $state.current.name === 'login.step3') {
      $rootScope.background = false;
    }

    // TODO: will be removed
    function onInit() {
      $scope.coins = [];
    }

    function getActiveCoins() {
      return $storage['iguana-login-active-coin'];
    }

    function getConnectedCoins() {
      return $storage['connected-coins'];
    }

    function isCoinsConnected() {
      return Object.keys(getConnectedCoins()).length > 0;
    }

    function isAppSetup() {
      return $storage.isAppSetup && isCoinsConnected();
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
        $rootScope.background = false;
      } else if ($state.current.name === 'login.step3') {
        $rootScope.background = false;
      }
      $rootScope.allowLoginStateChange = false;
    }

    function openFlowModal(type) {
      $scope.modal.flowModal.animation = type ? true : false;
      $scope.modal.flowModal.resolve = {
        'type': function() {
          return type ? type : 'signin';
        },
        'modal': function() {
          return $scope.modal;
        }
      };

      var modalInstance = $uibModal.open($scope.modal.flowModal);
    }

    function openCoinModal(type) {
      if (type === 'signin') {
        $storage['iguana-login-active-coin'] = {};
        $storage['iguana-active-coin'] = {};
      }

      $scope.modal.coinModal.resolve = {
        'type': function() {
          return type;
        },
        'modal': function() {
          return $scope.modal;
        }
      };

      var modalInstance = $uibModal.open($scope.modal.coinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(data) {
        if (type === 'signin') {
          var coinKeys = Object.keys($storage['iguana-login-active-coin']);
          $scope.coins = data;
          $scope.passphraseModel = coinKeys.length ? $storage['iguana-login-active-coin'][coinKeys[0]].pass : '';
          $state.go('login.step2');
        } else {
          $scope.loginActiveCoin = $storage['iguana-login-active-coin'];
          $state.go('signup.step1');
        }
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function loginCheck() {
      if ($storage['loginTermsAndConditions'] === true) {
        $auth.login(
          $scope.getActiveCoins(),
          $scope.passphraseModel
        );
      } else {
        $auth.loginCheck(
          $scope.getActiveCoins(),
          $scope.passphraseModel
        );
        $storage['loginTermsAndConditions']=true;
      }
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

    function goBack() {
      $storage['iguana-login-active-coin'] = {};
      $state.go('login');
      openCoinModal('signin');
    }
  }
]);