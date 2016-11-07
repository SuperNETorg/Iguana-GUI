'use strict';

angular.module('IguanaGUIApp.controllers', ['ngAnimate', 'ngSanitize', 'ngStorage', 'ui.bootstrap']);
angular.module('IguanaGUIApp', ['ui.router', 'ngSanitize', 'IguanaGUIApp.controllers', 'angular-clipboard'])
.service('helper', ['$uibModal', '$rootScope', 'clipboard', createHelpers])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginController'
    })
    .state('signup', {
      templateUrl: 'partials/signup.html',
      controller: 'signupController'
    })
    .state('signup.step1', {
      url: '/signup'
    })
    .state('signup.step2', {})
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'partials/dashboard.html',
      controller: 'dashboardController'
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'partials/reference-currency.html',
      controller: 'settingsController'
    });

  $urlRouterProvider.otherwise(function($injector) {
    var $state = $injector.get("$state");
    $state.go("login");
  });
})
.run(function($rootScope, $location, $state, helper) {
  // check session and route
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
    // TODO: find a better way
    if (!helper.checkSession(true) && toState.name !== 'signup.step1') {
      setTimeout(function() {
        $state.go('login');
      }, 0);
    }
    if (helper.checkSession(true) && (toState.name === 'login' || toState.name === 'signup.step1')) {
      event.preventDefault();
      setTimeout(function() {
        $state.go('dashboard');
      }, 0);
    }
  });

  $(document).ready(function() {
    api.testConnection();
  });
});
