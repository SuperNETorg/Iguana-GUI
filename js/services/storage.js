'use strict';

angular.module('IguanaGUIApp')
.service('$storage', [
  '$localStorage',
  function ($localStorage) {
    //todo Storage for chrome App
    /*return chrome.storage.sync;*/
    return $localStorage;
  }
]);