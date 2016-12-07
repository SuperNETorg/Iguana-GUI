
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
            angular.element(element[0].querySelector('.dropdown-menu')).toggleClass('block');


          });

          scope.default = 'Please select item';
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