'use strict';

angular.module('IguanaGUIApp.controllers')
  .controller(
    'loginController',
    [
      '$scope',
      '$http',
      '$state',
      'helper',
      '$log',
      '$uibModal',
      'Api',
      '$localStorage',
    function ($scope, $http, $state, helper, $log, $uibModal, Api, $localStorage) {
      $scope.helper = helper;
      $scope.$state = $state;
      $scope.isIguana = isIguana;
      $scope.$log = $log;
      $scope.passphraseModel = '';
      $scope.dev = dev;
      $scope.coinsSelectedToAdd = [];
      $scope.$modalInstance = {};
      $scope.receivedObject = undefined;

      Api.testCoinPorts(function () {
        $scope.availableCoins = helper.constructCoinRepeater();
      });

      $scope.openAddCoinModal = function () {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          controller: 'addCoinModalController',
          templateUrl: '/partials/add-coin.html',
          appendTo: angular.element(document.querySelector('.auth-add-coin-modal')),
          resolve: {
            receivedObject: function () {
              return $scope.receivedObject;
            }
          }
        });
        modalInstance.result.then(onDone);
        //modalInstance.result.catch(onCatch);

        function onDone(receivedObject) {
          var coinId,
              availableCoin;

          if (receivedObject.length > 1) $scope.passphraseModel = receivedObject; // dev
          $scope.coinsSelectedToAdd = [];
          $scope.receivedObject = $localStorage['iguana-login-active-coin'];

          for (var i = 0; $scope.receivedObject.length > i; i++) {
            coinId = $scope.receivedObject[i];

            for (var id in $scope.availableCoins) {
              availableCoin = $scope.availableCoins[id];

              if (availableCoin.coinId == coinId) {
                $scope.coinsSelectedToAdd.push(availableCoin);
              }
            }
          }
        }

        function onCatch() { // remove(?)
          $scope.receivedObject = $localStorage['iguana-login-active-coin'];

          if (data)
            if (data instanceof Array) {
              $scope.coinsSelectedToAdd = data;
            } else if (data == 'cancel' || !$scope.receivedObject.length) {
              $scope.coinsSelectedToAdd = [];
            }
        }
      };

      $scope.login = function () {
        var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);
        Api.walletLock(coinsSelectedToAdd[0].coinId);
        Api.walletLogin(
          $scope.passphraseModel,
          settings.defaultSessionLifetime,
          coinsSelectedToAdd[0].coinId,
          walletLoginThen
        );

        function walletLoginThen(walletLogin) {
          if (walletLogin === -14 || walletLogin === false) {
            helper.ngPrepMessageModal(
              helper.lang('MESSAGE.WRONG_PASSPHRASE'),
              'red',
              true);
          } else if (walletLogin === -15) {
            helper.ngPrepMessageModal(
              helper.lang('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'),
              'red',
              true
            );
          } else {
            $localStorage['iguana-' + coinsSelectedToAdd[0].coinId + '-passphrase'] = { 'logged': 'yes' };
            $localStorage['iguana-auth'] = { 'timestamp': Date.now() };
            $state.go('dashboard');
          }
        }
      };
    }]);