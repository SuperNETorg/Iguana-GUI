'use strict';

angular.module('IguanaGUIApp')
.controller('topMenuController', ['$scope', '$http', '$state', 'util', 'helper', '$auth',
  function($scope, $http, $state, util, helper, $auth) {
    $scope.$state = $state;
    $scope.util = util;
    $scope.helper = helper;
    $scope.enabled = $auth.checkSession(true);
}]);