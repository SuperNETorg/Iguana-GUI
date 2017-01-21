'use strict';

angular.module('IguanaGUIApp')
.directive('appTitle', [
  '$rootScope',
  '$filter',
  function($rootScope, $filter) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var listener = function(event, toState) {
          toState = toState ? toState : $rootScope.toState; // temp bit for unit test compat
          var title = $filter('lang')('IGUANA.APP_TITLE');

          if (toState.data && toState.data.pageTitle) {
            title = $filter('lang')('IGUANA.APP_TITLE') + ' / ' + $filter('lang')(toState.data.pageTitle);
          }

          (function() {
            element.text(title);
          })();
        };

        $rootScope.$on('$stateChangeStart', listener);
      }
    };
  }
]);