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
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'signupController'
    })
    .state('signup.verify', {
      url: '/verify',
      controller: 'signupController'
    })
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

  $urlRouterProvider.otherwise('/dashboard');
})
.run(function($rootScope, $location, $state, helper) {
  $(document).ready(function() {
    api.testConnection();
  });
  // check session and route
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
    if (!helper.checkSession(true)) {
      $state.go('login');
    }
    // TODO: find a better way
    if (helper.checkSession(true) && (toState.name === 'login' || toState.name === 'signup.passphrase' || toState.name === 'signup.verify')) {
      setTimeout(function() {
        $state.go('dashboard');
      }, 0);
    }
  });
});
