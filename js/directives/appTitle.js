'use strict';

angular.module('IguanaGUIApp')
.directive('appTitle', [
  '$rootScope',
  '$timeout',
  '$filter',
  function($rootScope, $timeout, $filter) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var listener = function(event, toState) {
          var title = $filter('lang')('IGUANA.APP_TITLE');

          if (toState.data && toState.data.pageTitle)
            title = $filter('lang')('IGUANA.APP_TITLE') + ' / ' + $filter('lang')(toState.data.pageTitle);

          $timeout(function() {
            element.text(title);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeStart', listener);
      }
    };
  }
]);