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
      if (!$storage.isIguana) {
        return Object.keys(getConnectedCoins()).length > 0;
      } else {
        if (vars.response.data.status === 200) {
          return true;
        } else {
          return false;
        }
      }
    }

    function isAppSetup() {
      return ($storage.isIguana || $storage.isAppSetup) && isCoinsConnected();
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

      if ($storage.isIguana) {
        $api.getSelectedCoins().then(
        function(response) {
          var selectedCoinsCount = 0;

          for (var i in response['data']) {
            switch (i) {
              case 'basilisk':
                setModes(0, response['data'][i]);
                break;
              case 'full':
                setModes(1, response['data'][i]);
                break;
              case 'native':
                setModes(-1, response['data'][i]);
                break;
              default:
                break;
            }
          }

          function setModes(mode, data) {
            var constructCoins = constructCoinRepeater(),
                coinName = '';

            for (var i = 0 ; data.length > i; i++) {
              selectedCoinsCount = i + 1;
              coinName =  data[i].toLowerCase();
              constructCoins[coinName].activeMode = mode;
              $storage['iguana-login-active-coin'][coinName] = constructCoins[coinName];
            }
          }

          if (selectedCoinsCount > 0) {
            login();
          } else {
            var modalInstance = $uibModal.open($scope.modal.coinModal);

            modalInstance.result.then(resultPromise);
            $scope.karma.modal = modalInstance; // tests
          }
        },
        function(response) {
          console.log(response);
        });
      } else {
        var modalInstance = $uibModal.open($scope.modal.coinModal);

        modalInstance.result.then(resultPromise);
      }

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
    }

    function constructCoinRepeater() {
      var index = 0,
          coinsArray = {},
          coinsInfo = vars.coinsInfo;

      if (coinsInfo) {
        for (var key in supportedCoinsList) {
          if (
            (!$storage['iguana-' + key + '-passphrase'] ||
              (
                $storage['iguana-' + key + '-passphrase'] &&
                ($storage['iguana-' + key + '-passphrase'].logged !== 'yes' ||
                ($storage['iguana-' + key + '-passphrase'].logged === 'yes' &&
                ($state.current.name.indexOf('login') > -1 || $state.current.name.indexOf('signup') > -1)))
              )
            )
          ) {
            if (
              ($storage.isIguana && coinsInfo[key] && coinsInfo[key].iguana === true) ||
              (
                !$storage.isIguana &&
                (coinsInfo[key] &&
                  coinsInfo[key].connection === true ||
                  (dev && dev.isDev && dev.showAllCoindCoins)
                )
              )
            ) {
              coinsArray[key] = {
                'id': key.toUpperCase(),
                'coinId': key.toLowerCase(),
                'name': supportedCoinsList[key].name,
                'color': $scope.coinColors[index],
                'pass': dev.isDev && !$storage.passphrase ? getPassphrase(key) : '',
                'mode': getMode(key),
                'activeMode': (getMode(key)['Full'] ? getMode(key)['Full'].key : false)
              };

              if (index === $scope.coinColors.length - 1) {
                index = 0;
              } else {
                index++;
              }
            }
          }
        }
      }

      return coinsArray;
    }

    function getPassphrase(coinId) {
      if (dev && dev.coinPW) {
        return ($scope.isIguana && dev.coinPW.iguana ? dev.coinPW.iguana :
          (dev.coinPW.coind[coinId] ? dev.coinPW.coind[coinId] : ''));
      } else {
        return '';
      }
    }

    function getMode(key) {
      var modeResult = {};

      if ($storage.isIguana) {
        var coinMode = iguanaCoinModes[key],
          modeSwitch = {},
          mode;

        for (var i = 0; coinMode.length > i; i++) {
          modeSwitch = {};
          mode = coinMode[i];

          if (coinMode.length === 1) {
            modeResult['Basilisk'] = {
              name: 'Basilisk',
              key: 0,
              status: false,
              disabled: true
            };
          }

          switch (mode) {
            case 0:
              modeResult['Basilisk'] = {
                name: 'Basilisk',
                key: mode,
                disabled: coinMode.length === 1
              };
              break;
            case 1:
              modeResult['Full'] = {
                name: 'Full',
                key: mode,
                status: true,
                disabled: false
              };
              break;
            case -1:
              modeResult['Native'] = {
                name: 'Native',
                key: mode,
                disabled: false
              };
              break;
          }
        }
      }

      return modeResult;
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
      /*if (
        (
          $storage.isIguana &&
          $scope.passphraseModel.split(' ').length !== 24
          && $rootScope.isElectron
        ) || (
          !$storage.isIguana &&
          $scope.passphraseModel.split(' ').length !== 12
          && $rootScope.isElectron
        )
      ) {
        $scope.messages = $filter('lang')('LOGIN.INCORRECT_INPUT').replace('{{ count }}', $scope.isIguana ? '24' : '12');
        $scope.isChanged = true;
      } else {
        $scope.isChanged = false;
      }*/
      if (!$scope.passphraseModel.length) {
        $scope.messages = $filter('lang')('LOGIN.INCORRECT_INPUT_ALT');
        $scope.isChanged = true;
      } else {
        $scope.isChanged = false;
      }
    }

    function goBack() {
      var state;
      $scope.passphraseModel = '';
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