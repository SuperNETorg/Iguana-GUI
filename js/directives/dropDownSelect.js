angular.module('IguanaGUIApp')
.directive('dropdown', [
  '$rootScope',
  '$timeout',
  '$filter',
  function($rootScope, $timeout, $filter) {
    return {
      restrict: 'E',
      require: '^ngModel',
      scope: {
        ngModel: '=', // selection
        items: '=',   // items to select from
        callback: '&' // callback
      },
      link: function(scope, element, attrs) {
        element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          angular.element(element[0].querySelector('.dropdown-button-style')).toggleClass('open');
          angular.element(element[0].querySelector('.dropdown-menu')).toggleClass('block');
        });

        angular.element(document.body).on('click', function() {
          angular.element(element[0].querySelector('.dropdown-button-style')).removeClass('open');
          angular.element(document.querySelector('.dropdown-menu')).removeClass('block');
        });

        scope.default = 'Please select item'; // TODO: move to lang.js
        scope.isButton = 'isButton' in attrs;

        // selection changed handler
        scope.select = function(item) {
          scope.ngModel = item;

          if (scope.callback) {
            scope.callback({ item: item });
          }
        };
      },
      templateUrl: 'partials/dropdown-template.html'
    };
  }
]);