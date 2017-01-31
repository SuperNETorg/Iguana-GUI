/* Iguana/services/bootstrap */
'use strict';

angular.module('IguanaGUIApp')
.controller('selectCoinModalController', [
  '$scope',
  '$state',
  '$uibModal',
  '$uibModalInstance',
  '$api',
  '$storage',
  '$rootScope',
  '$timeout',
  'vars',
  'type',
  'modal',
  '$window',
  function($scope, $state, $uibModal, $uibModalInstance, $api, $storage,
            $rootScope, $timeout, vars, type, modal, $window) {

    $scope.isIguana = $storage.isIguana;
    $scope.coinSearchModel = undefined;
    $scope.coinColors = [
      'orange',
      'breeze',
      'light-blue',
      'yellow'
    ];
    if (!$storage.isIguana) {
      $storage['iguana-login-active-coin'] = {};
    }

    $scope.back = back;
    $scope.next = next;
    $scope.close = close;
    $scope.clickOnCoin = clickOnCoin;
    $scope.isCoinsConnected = isCoinsConnected;
    $scope.isAppSetup = isAppSetup;
    $scope.getType = getType;
    $scope.clickOnMode = clickOnMode;
    $scope.type = type;
    $scope.modal = modal;

    $scope.coins = constructCoinRepeater();
    $scope.selectedCoins = getSelectedCoins();

    $scope.karma = { // tests
      getPassphrase: getPassphrase,
      getSelectedCoins: getSelectedCoins,
      constructCoinRepeater: constructCoinRepeater
    };

    $scope.isActive = function(item) {
      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = {};
      }

      return $storage['iguana-login-active-coin'][item.coinId];
    };

    $scope.isDisabled = function() {
      return Object.keys($storage['iguana-login-active-coin']).length == 0;
    };

    function getConnectedCoins() {
      return $storage['connected-coins'] || {};
    }

    function isCoinsConnected() {
      return Object.keys(getConnectedCoins()).length > 0;
    }

    function isAppSetup() {
      return $storage.isAppSetup && isCoinsConnected();
    }

    function getSelectedCoins() {
      var result = {},
          coins = constructCoinRepeater();

      if ($storage['iguana-login-active-coin']) {
        for (var i = 0; coins.length > i; i++) {
          if ($storage['iguana-login-active-coin'][coins[i].coinId]) {
            result[coins[i].coinId] = constructCoinRepeater()[i];
          }
        }
      }

      return result;
    }

    function getType() {
      return $scope.type;
    }

    function constructCoinRepeater() {
      var index = 0,
          coinsArray = [],
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
              coinsArray.push({
                'id': key.toUpperCase(),
                'coinId': key.toLowerCase(),
                'name': supportedCoinsList[key].name,
                'color': $scope.coinColors[index],
                'readonly': (
                  $storage.isIguana && key === 'kmd' &&
                  $state.current.name.indexOf('signup') !== -1 ?
                    true :
                    false
                ),
                'mode': getMode(key)
              });

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

    function clickOnCoin(item, $event) {
      var coinElement = angular.element($event.currentTarget);

      if (!coinElement.hasClass('active') && !$storage.isIguana) {
        $scope.selectedCoins = [];
        $storage['iguana-login-active-coin'] = {};
      }

      if (!$storage['iguana-login-active-coin'] && !$storage.isIguana) {
        $storage['iguana-login-active-coin'] = {};
      }

      if (!$storage['iguana-login-active-coin'][item.coinId]) {
        coinElement.addClass('active');

        if (dev.isDev && !$storage.passphrase) {
          item.pass = getPassphrase(item.coinId);
        } else {
          item.pass = $storage.passphrase;
        }
        $storage['iguana-login-active-coin'][item.coinId] = item;
      } else {
        coinElement.removeClass('active');
        delete $storage['iguana-login-active-coin'][item.coinId];
      }

      $scope.selectedCoins = $storage['iguana-login-active-coin'];

      if (!$storage.isIguana) {
        next();
      }
    }

    function clickOnMode(mode) {
    }

    function back() {
      if (isAppSetup()) {
        $state.go('login');
      } else {
        openFlowModal(getType());
      }

      close();
    }

    function close() {
      $uibModalInstance.dismiss(constructCoinRepeater());
    }

    function next() {
      $uibModalInstance.close(constructCoinRepeater());
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
      var getedMode = iguanaCoinModes[key],
          modeResult = [],
          modeSwitch = {},
          mode;

      for (var i = 0; getedMode.length > i; i++) {
        modeSwitch = {};
        mode = getedMode[i];

        switch (mode) {
          case 0:
            modeSwitch.name = 'Light';
            modeSwitch.key = mode;
            modeSwitch.status = true;
            break;
          case 1:
            modeSwitch.name = 'Full';
            modeSwitch.key = mode;
            break;
          case -1:
            modeSwitch.name = 'Native';
            modeSwitch.key = mode;
            break;
        }

        modeResult.push(modeSwitch);
      }

      return modeResult;
    }

    function openFlowModal(type) {
      $scope.modal.flowModal.appendTo = angular.element(document.querySelector('.flow-modal'));
      $scope.modal.flowModal.resolve = {
        'type': function() {
          return type;
        },
        'modal': function() {
          return $scope.modal;
        }
      };
      var modalInstance = $uibModal.open($scope.modal.flowModal);
    }

    /*$scope.$watchCollection('coinModeRadioModel', function () {

      $scope.checkResults = [];
      angular.forEach($scope.coinModeRadioModel, function (value, key) {
        if (value) {
          $scope.coinModeRadioModel.push(key);
        }
      });
    });*/

    $scope.$on('$destroy', function() {
      angular.element(document.querySelector('.auth-add-coin-modal .modal-content')).unbind('scroll');
      angular.element($window).unbind('resize');
      delete $rootScope.$$listeners['modal.dismissed'];
    });

    // reveal/hide bottom gradient
    $timeout(function() {
      var gradientElement = angular.element(document.querySelector('.auth-add-coin-modal .container-arrow')),
          modalContainer = document.querySelector('.auth-add-coin-modal .modal-content');

      function applyGradient() {
        if (document.querySelector('.auth-add-coin-modal .form-content') && document.querySelector('.auth-add-coin-modal .form-content').clientHeight <= modalContainer.clientHeight ||
            modalContainer && modalContainer.scrollTop === (modalContainer.scrollHeight - modalContainer.offsetHeight)) {
          gradientElement.css({ 'opacity': 0 });
        } else {
          gradientElement.css({ 'opacity': 1 });
        }
      }

      applyGradient();

      angular.element($window).bind('resize', function(event) {
        applyGradient();
      });

      angular.element(modalContainer).bind('scroll', function(event) {
        if (modalContainer.scrollTop === (modalContainer.scrollHeight - modalContainer.offsetHeight)) {
          gradientElement.css({ 'opacity': 0 });
        } else {
          gradientElement.css({ 'opacity': 1 });
        }
      });
    }, 500);
  }
]);