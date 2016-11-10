'use strict';

angular.module('IguanaGUIApp.controllers', ['ngAnimate', 'ngSanitize', 'ngStorage', 'ui.bootstrap'])
.service('helper', ['$uibModal', '$rootScope', 'clipboard', '$timeout', '$interval', '$state', '$localStorage', createHelpers])
angular.module('IguanaGUIApp', ['ui.router', 'ngSanitize', 'IguanaGUIApp.controllers', 'angular-clipboard'])
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
      views: {
        '@': {
          templateUrl:  'partials/dashboard.html',
          controller: function($scope, $state) {
            $scope.$state = $state;
          }
        }
      }
    })
    .state('dashboard.main', {
      url: '/dashboard',
      views : {
        'top@dashboard': {
          templateUrl: 'partials/dashboard-top-menu.html',
          controller: 'topMenuController'
        },
        'content@dashboard': {
          templateUrl: 'partials/dashboard-main.html',
          controller: 'dashboardController'
        },
        'modals@dashboard': {
          templateUrl: 'partials/dashboard-modals.html',
          controller: 'dashboardController'
        }
      }
    })
    .state('dashboard.settings', {
      url: '/settings',
      views : {
        'top@dashboard': {
          templateUrl: 'partials/dashboard-top-menu.html',
          controller: 'topMenuController'
        },
        'content@dashboard': {
          templateUrl: 'partials/reference-currency.html',
          controller: 'settingsController'
        }
      }
    });

  $urlRouterProvider.otherwise(function($injector) {
    var $state = $injector.get("$state");
    $state.go("login");
  });
})
.run(function($rootScope, $location, $state, helper, $timeout, api) {
  // check session and route
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
    // TODO: find a better way
    if (!helper.checkSession(true) && toState.name !== 'signup.step1') {
      $timeout(function() {
        $state.go('login');
      }, 0);
    }
    if (helper.checkSession(true) && (toState.name === 'login' || toState.name === 'signup.step1')) {
      event.preventDefault();
      $timeout(function() {
        $state.go('dashboard');
      }, 0);
    }
  });

  api.testConnection(); // switch with Api service once it's finished
});
