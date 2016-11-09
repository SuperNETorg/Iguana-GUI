'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('topMenuController', ['$scope', '$http', '$state', 'helper',
  function($scope, $http, $state, helper) {
    $scope.$state = $state;
    $scope.helper = helper;
    $scope.enabled = helper.checkSession(true);
}]);