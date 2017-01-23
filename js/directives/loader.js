'use strict';

angular.module('IguanaGUIApp')
.directive('loader', [
  '$rootScope',
  '$filter',
  '$window',
  '$http',
  '$state',
  'vars',
  function($rootScope, $filter, $window, $http, $state, vars) {
    var attrs = [
      'global-loader',
      'content-loader'
    ];

    function globalLoader(...attributes) {
      if (attributes[0]) {
        document.querySelector('[' + attrs[0] + ']');
        angular.element(document.querySelector('.global-loader')).addClass("hide-loader");
      } else {
        angular.element(document.querySelector('.global-loader')).removeClass("hide-loader");
      }
    }

    return {
      link: function(...attrs) {
        var scopeAttrs = attrs;
        attrs[0].vars = vars;

        $rootScope.$watchCollection(function() {
          return vars.loading;
        }, function(newVal, oldVal) {
          var localAttrs = scopeAttrs.splice(0, scopeAttrs.length);

          localAttrs.unshift(oldVal);
          globalLoader.apply(this, localAttrs);
        });
      }
    };
  }
]);