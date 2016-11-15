'use strict';

angular.module('IguanaGUIApp.controllers', [
  'ngAnimate',
  'ngSanitize',
  'ngStorage',
  'ui.bootstrap'
])
.value('vars', {})
.service('helper', [
  '$uibModal',
  '$rootScope',
  'clipboard',
  '$timeout',
  '$interval',
  '$state',
  '$localStorage',
  'vars',
  createHelpers
])
angular.module('IguanaGUIApp', [
  'ui.router',
  'ngSanitize',
  'IguanaGUIApp.controllers',
  'angular-clipboard'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginController',
      data: {
        pageTitle: 'PAGE.LOGIN'
      }
    })
    .state('signup', {
      templateUrl: 'partials/signup.html',
      controller: 'signupController'
    })
    .state('signup.step1', {
      url: '/signup',
      data: {
        pageTitle: 'PAGE.CREATE'
      }
    })
    .state('signup.step2', {
      data: {
        pageTitle: 'PAGE.VERIFY'
      }
    })
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
      data: {
        pageTitle: 'PAGE.DASHBOARD'
      },
      views : {
        'top@dashboard': {
          templateUrl: 'partials/dashboard-top-menu.html',
          controller: 'topMenuController'
        },
        'content@dashboard': {
          templateUrl: 'partials/dashboard-main.html',
          controller: 'dashboardController'
        }
      }
    })
    .state('dashboard.settings', {
      url: '/settings',
      data: {
        pageTitle: 'PAGE.SETTINGS'
      },
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
.run(function($rootScope, $location, $state, util, $timeout, $api) {
  // check session and route
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
    // TODO: find a better way
  //   if (!util.checkSession() && toState.name !== 'signup.step1') {
  //     $timeout(function() {
  //       $state.go('login');
  //     }, 0);
  //   }
  //   if (util.checkSession() && (toState.name === 'login' || toState.name === 'signup.step1')) {
  //     event.preventDefault();
  //     $timeout(function() {
  //       $state.go('dashboard.main');
  //     }, 0);
  //   }
  });
  $api.testConnection().then(function (coins) {
    debugger
    $rootScope.$broadcast('coinsInfo', coins);
  }); // switch with Api service once it's finished
});
