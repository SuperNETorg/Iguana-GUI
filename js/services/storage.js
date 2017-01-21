'use strict';

angular.module('IguanaGUIApp')
.service('$storage', [
  '$localStorage',
  function($localStorage) {
    return $localStorage;
  }
]);