'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('signupController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;

    $scope.isShow = true;
    $(document).ready(function() {
      api.testConnection(initPage);
    });

    $scope.bakeToLogin = bakeToLogin;

    function initPage() {
      if (helper.checkSession(true)) {
        $state.go('dashboard');
      }
    }

    function bakeToLogin(){
      $state.go('login');
    }
}]);