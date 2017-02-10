'use strict';

angular.module('IguanaGUIApp')
.directive('historyAnimate', [
  '$rootScope',
  '$filter',
  '$window',
  '$state', function($rootScope, $filter) {
    return {
      link: function(scope, element) {
        scope.closeTransaction = toggleHistoryContent.bind(null, false);
        element.on('click', toggleHistoryContent.bind(null, true));

        function toggleHistoryContent(notToggle, $event) {
          $event.stopPropagation();

          var hiddenTags = element[0].querySelectorAll('[hidden-content]'),
              fnName = 'toggleClass';

          if (notToggle) {
            fnName = 'removeClass';
          }

          angular.element(hiddenTags)[fnName]('hidden');
        }
      }
    };
  }
]);