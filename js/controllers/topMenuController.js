'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('topMenuController', ['$scope', '$http', '$state', 'util', 'helper',
  function($scope, $http, $state, util, helper) {
  //debugger
    $scope.$state = $state;
    $scope.util = util;
    $scope.helper = helper;
    $scope.enabled = helper.checkSession(true);
}]);