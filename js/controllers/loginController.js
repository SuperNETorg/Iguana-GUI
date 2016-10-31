'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('loginController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;

    setTimeout(function() {
      console.log(helper.checkSession());
    }, 1000);

    console.log($state.current);

    $scope.NameChange = function () {
        $scope.greeting = "Hello " + $scope.name;
        $scope.nameError = true;
    };

    $(document).ready(function() {
      api.testConnection(initPage);
    });

    function initPage() {
      if (helper.checkSession(true)) {
        $state.go('dashboard');
      }
    }
}]);