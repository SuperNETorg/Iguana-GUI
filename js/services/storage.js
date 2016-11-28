'use strict';

angular.module('IguanaGUIApp')
.service('$storage', [
  '$localStorage',
  function($localStorage) {
    //todo Storage for chrome App
    /*-- start --*/
    /*return chrome.storage.sync;*/
    return $localStorage;
    /*-- end --*/
  }
]);