angular.module('IguanaGUIApp')
.directive('resize', function ($window) {

  return function (scope, element, attr) {
    var w = $window;
    scope.$watch(function () {
      return {
        'h': w.innerHeight,
        'w': w.innerWidth
      };
    }, function (newV, oldV) {
      scope.windowHeight = newV.h;
      scope.windowWidth = oldV.w;
      scope.$eval(attr.resize);
    }, true);

    angular.element(w).bind('resize', function () {
      scope.$apply();
    });
  };
});