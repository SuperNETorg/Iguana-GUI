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
  function($scope, $http, $state, util, $auth, $uibModal, $api,
           $storage, $timeout, $rootScope, $filter, $message, vars) {
    var pageTitle;

    $storage['iguana-active-coin'] = {};

    $scope.util = util;
    $scope.coinsInfo = vars.coinsInfo;
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
    $storage['iguana-active-coin'] = {};
    $scope.messages = '';
    $scope.loginActiveCoin = '';
    $rootScope.background = true;
    $scope.isCoinsConnected = isCoinsConnected;
    $scope.isAppSetup = isAppSetup;
    $scope.title = setTitle;
    $scope.loginCheck = loginCheck;
    $scope.login = login;
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
    $scope.coinColors = [
      'orange',
      'breeze',
      'light-blue',
      'yellow'
    ];
    $scope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('onLoad', onLoad);

    if (!$storage.isIguana) {
      $scope.activeCoins = $storage['iguana-login-active-coin'] || {};
    }

    if (!$scope.coinsInfo) {
      $rootScope.$on('coinsInfo', onInit);
    } else {
      onInit();
    }

    if ($state.current.name === 'login.step2' ||
        $state.current.name === 'login.step3') {
      $rootScope.background = false;
    }

    function onInit() {
      isCoinSelected();
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

      return !$storage.isIguana ? Object.keys($storage['iguana-login-active-coin']).length === 0 : false;
    }

    function stateChangeStart() {
      // default attrs (event, toState, toParams, fromState, fromParams, options)
      var toState = arguments[1];
      if (toState.name === 'login') {
        $rootScope.background = true;
      } else if (toState.name === 'login.step2') {
        $rootScope.background = false;
      } else if (toState.name === 'login.step3') {
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
      if (type === 'signin' && !$scope.isIguana) {
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
          $scope.passphraseModel = !$scope.passphraseModel ?
                                    (
                                      dev.isDev && coinKeys.length ?
                                        $storage['iguana-login-active-coin'][coinKeys[0]].pass :
                                        ''
                                    ) : $scope.passphraseModel;
          $storage['dashboard-pending-coins'] = !!coinKeys;
          if (!$storage.loginTermsAndConditions && $storage.isIguana) {
            $state.go('login.step3');
          } else {
            if ($storage.isIguana) {
              login();
            } else {
              $state.go('login.step2');
            }
          }
        } else {
          $scope.loginActiveCoin = $storage['iguana-login-active-coin'];
          $state.go('signup.step1');
        }
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function login() {
      $storage.loginTermsAndConditions = true;
      $auth.login(
        $scope.getActiveCoins(),
        $scope.passphraseModel
      );
    }

    function loginCheck() {
      $auth.loginCheck(
        $scope.getActiveCoins(),
        $scope.passphraseModel
      );
    }

    function setTitle() {
      var coinNames = [];

      pageTitle = $filter('lang')('LOGIN.LOGIN_TO_WALLET');

      if (!$storage.isIguana) {
        if (

          $storage['iguana-login-active-coin'] &&
          Object.keys($storage['iguana-login-active-coin']).length &&
          $storage['iguana-login-active-coin'][Object.keys($storage['iguana-login-active-coin'])[0]]
        ) {
          for (var name in $scope.getActiveCoins()) {
            coinNames.push($scope.getActiveCoins()[name].name);
          }
        }
      } else {
        coinNames = ['Iguana'];
      }

        pageTitle = pageTitle.replace('{{ coin }}', coinNames.join(', '));

      return pageTitle;
    }

    function isChanged() {
      $scope.messages = $filter('lang')('LOGIN.INCORRECT_INPUT').replace('{{ count }}', $scope.isIguana ? '24' : '12');
      $scope.isChanged = true;
    }

    function goBack() {
      var state;

      if (!$storage.isIguana) {
        $storage['iguana-login-active-coin'] = {};
      }

      if (!$auth._userIdentify()) {
        state = 'login';
      } else {
        state = 'dashboard.main';
      }

      $state.go(state);
    }
    
    function onLoad() {
      delete $storage['iguana-login-active-coin'];
    }
  }
]);