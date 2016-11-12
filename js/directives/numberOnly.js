'use strict';

angular.module('IguanaGUIApp')
.directive('numberOnly', ['$document', function($document) {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        if (inputValue == undefined) return '';

        var transformedInput = inputValue.replace(/[^0-9.]/g, '');

        if (inputValue.match(/\./g) && inputValue.match(/\./g).length > 1) { // allow only one dot
          var inputValSplit = inputValue.split('.');
          transformedInput = inputValSplit[0] + '.' + inputValSplit[1];
        }

        if (transformedInput !== inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }

        return transformedInput;
      });
    }
  };
}]);