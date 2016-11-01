'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('signupController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;
    $scope.$state = $state;

    $(document).ready(function() {
      api.testConnection(initPage);
    });

    function initPage() {
      if (helper.checkSession(true)) {
        $state.go('dashboard');
      }
    }
}]);