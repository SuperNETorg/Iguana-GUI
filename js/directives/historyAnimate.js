'use strict';

angular.module('IguanaGUIApp')
.directive('historyAnimate', [
  '$rootScope',
  '$filter',
  '$window',
  '$state', function($rootScope, $filter) {
    return {
      link: function(scope, element) {
        element.on('click', function () {
          if(element.hasClass('close-history-sheet')) {
            debugger;
            element.parent('.fadeIn').children('.animate-sheet').addClass('hide-sheet');;
            element.children('.close-button').addClass('close-hide');
            element.parent('.fadeIn').removeClass('fadeIn');
          } else {
            element.addClass('fadeIn');
            element.children('.animate-sheet').removeClass('hide-sheet');
            element.children('.close-button').children('.close-history-sheet').removeClass('close-hide');
          }
        });
      }
    };
  }
]);