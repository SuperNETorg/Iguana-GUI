'use strict';

angular.module('IguanaGUIApp')
.controller('messageController', [
  '$scope',
  '$state',
  '$auth',
  '$rootScope',
  '$filter',
  function($scope, $state, $auth, $rootScope, $filter) {
    $scope.$state = $state;
    $scope.$auth = $auth;
    $scope.enabled = $auth.checkSession(true);

    if ($rootScope.messageType === 'noDaemon') {
      $scope.color = 'red';
    }

    $scope.requirementsInfo = function() {
      // "No required daemon is running" message always stays active on top of any ui
      //  this ensures that users won't interact with any elements until connectivity problems are resolved
      $scope.messageType = '';
      $scope.color = 'blue';
      $scope.messageContent = $filter('lang')('MESSAGE.MINIMUM_DAEMON_CONF');
    }

    if ($rootScope.message) {
      $scope.color = $rootScope.messageColor;
      $scope.messageContent = $rootScope.message;
    }

    $scope.logout = function() {
      $auth.logout();
    }
  }
]);