'use strict';

angular.module('IguanaGUIApp.controllers', []);
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
    /*.state('create', {
      url: '/create-account',
      templateUrl: 'partials/create-account.html',
      controller: 'createAccountController'
    })
    .state('create.verify', {
      url: '/create-account-verify',
      templateUrl: 'partials/create-account-verify.html',
      controller: 'createAccountController'
    })*/
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'partials/dashboard.html',
      controller: 'dashboardController'
    })
    /*.state('dashboard.settings', {
      url: '/settings',
      templateUrl: 'partials/settings.html',
      controller: 'settingsController'
    });*/

  $urlRouterProvider.otherwise('/login');
});