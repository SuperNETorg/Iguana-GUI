'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('signupController', ['$scope', '$http', '$state', 'helper',
  function($scope, $http, $state, helper) {
    $scope.helper = helper;
    $scope.$state = $state;
    $scope.isShow = true;

    $scope.bakeToLogin = bakeToLogin;

    function bakeToLogin(){
      $state.go('login');
    }
}]);