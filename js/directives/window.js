angular.module('IguanaGUIApp')
.directive('window', function($rootScope, $window) {
  return {

    link: function(scope, element, attr) {
      $window.onbeforeunload = function(e) {
        $rootScope.$broadcast('onBeforeUnload');
      };

      $window.onunload = function() {
        $rootScope.$broadcast('onUnload');
      };

      $window.onload = function() {
        $rootScope.$broadcast('onLoad');
      };
    }
  }
});