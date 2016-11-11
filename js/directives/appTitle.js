'use strict';

var app = angular.module('IguanaGUIApp')
app.directive('appTitle', ['$rootScope', '$timeout', 'util',
  function($rootScope, $timeout, util) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var listener = function(event, toState) {
          var title = util.lang('IGUANA.APP_TITLE');

          if (toState.data && toState.data.pageTitle)
            title = util.lang('IGUANA.APP_TITLE') + ' / ' + util.lang(toState.data.pageTitle);

          $timeout(function() {
            element.text(title);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeStart', listener);
      }
    };
  }
]);