'use strict';

angular.module('IguanaGUIApp')
.controller('messageController', [
  '$scope',
  '$state',
  '$auth',
  '$rootScope',
  '$filter',
  'vars',
  '$uibModalInstance',
  function($scope, $state, $auth, $rootScope, $filter, vars, $uibModalStack) {
    $scope.$state = $state;
    $scope.$filter = $filter;
    $scope.$auth = $auth;
    $scope.enabled = $auth.checkSession(true);
    $scope.karma = {switchMessageBoxColor: switchMessageBoxColor }; // tests

    $scope.requirementsInfo = function() {
      // "No required daemon is running" message always stays active on top of any ui
      //  this ensures that users won't interact with any elements until connectivity problems are resolved
      $scope.messageType = '';
      switchMessageBoxColor('blue');
      $scope.messageContent = $filter('lang')('MESSAGE.MINIMUM_DAEMON_CONF');
    };

    if ($rootScope.message) {
      $scope.messageContent = $rootScope.message;
    }

    function switchMessageBoxColor(color) {
      angular.element(document.querySelector('.iguana-modal'))
             .removeClass('msg-null')
             .removeClass('msg-blue')
             .removeClass('msg-red')
             .removeClass('msg-green')
             .addClass('msg-' + color);
    }

    $scope.logout = function() {
      $uibModalStack.close();
      $auth.logout();
    }
  }
]);