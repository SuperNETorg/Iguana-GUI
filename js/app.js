'use strict';

if (!dev) var dev = { // prod
  isDev: false,
  showSyncDebug: false,
  showConsoleMessages: false,
  coinPW: null,
  coinAccountsDev: null,
  sessions: null
};

angular.module('IguanaGUIApp.controllers', [
  'ngAnimate',
  'ngSanitize',
  'ngStorage',
  'ui.bootstrap'
])
.value('vars', {});
angular.module('IguanaGUIApp', [
  'ui.router',
  'ngSanitize',
  'IguanaGUIApp.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  //ToDo history provider
  /*--historyProvider
  $provider.decorator('$window', function($delegate) {
    Object.defineProperty($delegate, 'history',
      {get: function () {
        return null;
      }});
    return $delegate;
  });
  endHistoryProvider--*/

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginController',
      data: {
        pageTitle: 'PAGE.LOGIN'
      }
    })
    .state('login.step2', {
      // url: '/step2',
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
      views: {
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
      views: {
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
.run(function($rootScope, $location, $state, util, $timeout, $api, $auth) {

  $rootScope.$on("$stateChangeStart",
    function(event, toState, toParams, fromState, fromParams) {
      $auth.toState = toState;
      $auth.toParams = toParams;
      $auth.fromState = fromState;
      $auth.fromParams = fromParams;
      // check session and route
      $timeout($auth.checkSession);
  });

  $api.testConnection().then(function(coins) {
    $rootScope.$broadcast('coinsInfo', coins);
  }); // switch with Api service once it's finished
});
