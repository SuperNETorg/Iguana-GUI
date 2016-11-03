'use strict';

var app = angular.module('IguanaGUIApp.controllers');
app.controller('loginController', ['$scope', '$http', '$state', 'helper', 'Step', function($scope, $http, $state, helper, Step) {
    $scope.helper = helper;

    $scope.next = next;

    $scope.createAccount = createAccount;

    setTimeout(function() {
      console.log(helper.checkSession());
    }, 1000);

    console.log($state.current);

    $(document).ready(function() {
      api.testConnection(initPage);
    });

    function initPage() {
      if (helper.checkSession(true)) {
        $state.go('dashboard');
      }
    }

    function next(){
      var next = Step.nextStap();
      $state.go(next);
    }

    function createAccount(){
      $state.go('create-account');
    }
}]);