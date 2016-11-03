'use strict';

angular.module('IguanaGUIApp.controllers', ['ngStorage']);

angular.module('IguanaGUIApp', ['ui.router', 'IguanaGUIApp.controllers'])
.service('helper', createHelpers)
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    // route to show our basic form (/form)
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginController'
    })
    .state('create-account', {
      url: '/create-account',
      templateUrl: 'partials/signup.html',
      controller: 'signupController'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'signupController'
    })
    .state('signup.verify', {
      url: '/signup-verify',
      templateUrl: 'partials/signup.html',
      controller: 'createAccountController'
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

  $urlRouterProvider.otherwise('/login');
});