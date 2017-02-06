'use strict';

angular.module('IguanaGUIApp')
.service('$storage', [
  '$localStorage',
  '$sessionStorage',
  '$rootScope',
  function($localStorage, $sessionStorage, $rootScope) {
    if (typeof require === 'function') {
      $rootScope.isElectron = true;
    }

    if ($rootScope.isElectron) {
      return $sessionStorage;
    } else {
      return $localStorage;
    }
  }
]);