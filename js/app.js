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
      templateUrl: 'partials/signup.html',
      controller: 'loginController' // TODO: split, move to signupController
    })
    .state('signup.passphrase', {
      url: '/signup',
    })
    .state('signup.verify', {
      url: '/verify',
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

// TODO: check session on before state change
