'use strict';

angular.module('IguanaGUIApp')
.controller('topMenuController', [
  '$scope',
  '$state',
  '$auth',
  function($scope, $state, $auth) {
    $scope.$state = $state;
    $scope.enabled = $auth.checkSession(true);
  }
]);