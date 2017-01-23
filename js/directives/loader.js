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

    function globalLoader(...attributes) {
      if (attributes[0]) {
        document.querySelector('[' + attrs[0] + ']');
        angular.element(document.querySelector('.global-loader')).addClass("hide-loader");
      } else {
        vars.effect = false;
        angular.element(document.querySelector('.global-loader')).removeClass("hide-loader");
      }
    }

    return {
      scope: true,
      link: function(...attrs) {
        attrs[0].vars = vars;
        $timeout(function(){
          angular.element(document.querySelector('.loader-image')).css('display','none');
          vars.effect = true;
        }, 1000);

        $timeout(function(){
          angular.element(document.querySelector('.loader-image')).css('display','block');
          vars.effect = false;
        },1500);
      }
    };
  }
]);