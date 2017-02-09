'use strict';

angular.module('IguanaGUIApp')
.directive('historyAnimate', [
  '$rootScope',
  '$filter',
  '$window',
  '$state', function($rootScope, $filter) {
    return {
      link: function(scope, element) {

        scope.closeTransaction = function ($event) {
          $event.stopPropagation();
          var hiddenTags = element[0].querySelectorAll('[hidden-content]');
          angular.element(hiddenTags).addClass('hidden');
          element.removeClass('fadeIn');
        };

        element.on('click', function () {
          var hiddenTags = element[0].querySelectorAll('[hidden-content]');
          angular.element(hiddenTags).removeClass('hidden');
          element.addClass('fadeIn');
        });
      }
    };
  }
]);