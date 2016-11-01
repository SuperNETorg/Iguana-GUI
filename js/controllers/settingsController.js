'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('settingsController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;

    setTimeout(function() {
      console.log(helper.checkSession());
    }, 1000);

    console.log($state.current);
}]);