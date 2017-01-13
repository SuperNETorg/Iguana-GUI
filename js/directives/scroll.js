angular.module('IguanaGUIApp')
.directive('scroll',
  ['$rootScope', '$filter', '$window','$state',
  function($rootScope, $filter,$window, $state) {

    return {
      link: function () {
        $rootScope.$watch(function(){
          return $state.$current.name
        }, function(newVal, oldVal){
          if(oldVal !== newVal) {
            window.scrollTo(0, 0);
          }
        });
      }
    };
  }
]);