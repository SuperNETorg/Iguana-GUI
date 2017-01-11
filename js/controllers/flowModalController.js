angular.module('IguanaGUIApp')
.controller('flowModalController', [
  '$scope',
  '$state',
  '$storage',
  '$uibModal',
  '$uibModalInstance',
  'type',
  'modal',
  function($scope, $state, $storage, $uibModal, $uibModalInstance, type, modal) {
    $scope.openLoginCoinModal = openLoginCoinModal;
    $scope.openSignupCoinModal = openSignupCoinModal;
    $scope.next = next;
    $scope.getConnectedCoins = getConnectedCoins;
    $scope.isCoinsConnected = isCoinsConnected;
    $scope.close = close;
    $scope.type = type;
    $scope.modal = modal;
    $scope.karma = { // tests
      next: next,
      close: close,
      openLoginCoinModal: openLoginCoinModal,
      openSignupCoinModal: openSignupCoinModal
    };

    function next() {
      if (isCoinsConnected()) {
        $storage.isAppSetup = true;
        $uibModalInstance.close();

        $uibModalInstance.closed.then(function() {
          if ($scope.type === 'signin') {
            openLoginCoinModal();
          } else if ($scope.type === 'signup') {
            openSignupCoinModal();
          }
        });
      }

      $scope.karma.modal = $uibModalInstance; // tests
    }

    function close() {
      $uibModalInstance.close();
    }

    function openLoginCoinModal() {
      $scope.modal.coinModal.resolve = {
        'type': function() {
          return 'signin';
        },
        'modal': function() {
          return $scope.modal;
        }
      };

      var modalInstance = $uibModal.open($scope.modal.coinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {
        var coinKeys = Object.keys($storage['iguana-login-active-coin']);

        $scope.coins = data;
        $scope.passphraseModel = coinKeys.length ? $storage['iguana-login-active-coin'][coinKeys[0]].pass : '';
        $state.go('login.step2');
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function openSignupCoinModal() {
      $storage['iguana-login-active-coin'] = {};
      $storage['iguana-active-coin'] = {};
      $scope.modal.coinModal.resolve = {
        'type': function() {
          return 'signup';
        },
        'modal': function() {
          return $scope.modal;
        }
      };
      var modalInstance = $uibModal.open($scope.modal.coinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {
        $scope.loginActiveCoin = $storage['iguana-login-active-coin'];
        $state.go('signup.step1');
      }

      $scope.karma.modal = modalInstance; // tests
    }

    function getConnectedCoins() {
      return $storage['connected-coins'];
    }

    function isCoinsConnected() {
      var coins = getConnectedCoins();

      return coins && Object.keys(coins).length > 0;
    }
  }
]);