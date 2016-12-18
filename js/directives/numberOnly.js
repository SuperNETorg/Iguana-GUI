'use strict';

angular.module('IguanaGUIApp')
.directive('numberOnly', [
  '$document',
  '$filter',
  function($document, $filter) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function(inputValue) {
          if (inputValue == undefined) return '';

          var transformedInput = inputValue.replace(/[^0-9.]/g, '');

          if (inputValue.match(/\./g) && inputValue.match(/\./g).length > 1) { // allow only one dot
            var inputValSplit = inputValue.split('.');

            transformedInput = inputValSplit[0] + '.' + inputValSplit[1];
          }

          var inputValSplit = transformedInput.split('.');

          if ((inputValSplit[0].match(/0/g) && inputValSplit[0].match(/0/g).length > 1 && !inputValSplit[0].match(/[1-9]/g)) || // disallow leading zero on the left side
              (Number(inputValSplit[0][0]) === 0 && Number(inputValSplit[0][1]) > 0)) {
            transformedInput = '0.' + inputValSplit[1];
          }

          if (transformedInput !== inputValue) {
            modelCtrl.$setViewValue(transformedInput);
            modelCtrl.$render();
          }

          return transformedInput;
        });
      }
    };
  }
]);