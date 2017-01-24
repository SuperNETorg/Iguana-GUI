'use strict';

angular.module('IguanaGUIApp')
.directive('loader', [
  '$rootScope',
  '$filter',
  '$window',
  '$http',
  '$state',
  '$timeout',
  'vars',
  function($rootScope, $filter, $window, $http, $state, $timeout, vars) {
    var attrs = [
      'global-loader',
      'content-loader'
    ];

    return {
      scope: true,
      link: function() {
        arguments[0].vars = vars;
        $timeout(function() {
          // angular.element(document.querySelector('.loader-image')).css('display','none');
          if(!vars.effect) {
            vars.effect = true;
          } else {
            angular.element(document.querySelector('.loader-image')).css('display','block');
            vars.effect = false;
          }

        }, 1000);

      }
    };
  }
]);