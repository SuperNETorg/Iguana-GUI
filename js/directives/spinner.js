'use strict';

angular.module('IguanaGUIApp')
.directive('spinner', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      isVisible: "=visibility"
    },
    template:
    '<div class="loader" ng-if="isVisible">' +
      '<svg class="circle">' +
        '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="5" stroke-miterlimit="10" />' +
        '<circle class="path2" cx="50" cy="50" r="20" fill="none" stroke-width="5" stroke-miterlimit="10" />' +
        '<circle class="path3" cx="50" cy="50" r="20" fill="none" stroke-width="5" stroke-miterlimit="10" />' +
        '<circle class="path4" cx="50" cy="50" r="20" fill="none" stroke-width="5" stroke-miterlimit="10" />' +
      '</svg>' +
   '</div>'
  }
});