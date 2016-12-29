angular.module('IguanaGUIApp')
.controller('flowModalController', [
  '$scope',
  '$state',
  '$storage',
  '$uibModal',
  '$uibModalInstance',
  'type',
  function($scope, $state, $storage, $uibModal, $uibModalInstance, type) {

    $scope.openLoginCoinModal = openLoginCoinModal;
    $scope.openSignupCoinModal = openSignupCoinModal;
    $scope.next = next;
    $scope.close = close;
    $scope.type = type;
    $scope.karma = {}; // tests

    var selectCoinModal = {
      animation: true,
      ariaLabelledBy: 'modal-title',
      size: 'full',
      ariaDescribedBy: 'modal-body',
      controller: 'selectCoinModalController',
      templateUrl: 'partials/add-coin.html',
      appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
    };

    function next() {
      $uibModalInstance.close();
      $uibModalInstance.closed.then(function() {
        if ($scope.type === 'signin') {
          openLoginCoinModal();
        } else if ($scope.type === 'signup') {
          openSignupCoinModal();
        }
      });
    }

    function close() {
      $uibModalInstance.close();
    }

    function openLoginCoinModal() {
      selectCoinModal.resolve = {
        'type': function() {
          return 'signin';
        }
      };

      var modalInstance = $uibModal.open(selectCoinModal);

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
      selectCoinModal.resolve = {
        'type': function() {
          return 'signup';
        }
      };
      var modalInstance = $uibModal.open(selectCoinModal);

      modalInstance.result.then(resultPromise);

      function resultPromise(event, data) {
        $scope.loginActiveCoin = $storage['iguana-login-active-coin'];
        $state.go('signup.step1');
      }

      $scope.karma.modal = modalInstance; // tests
    }
  }
]);