'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('topMenuController', ['$scope', '$http', '$state', 'util',
  function($scope, $http, $state, util) {
  debugger
    $scope.$state = $state;
    $scope.helper = helper;
    $scope.util = util;
    $scope.enabled = helper.checkSession(true);
}]);