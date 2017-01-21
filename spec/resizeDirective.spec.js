describe('resize directive test', function() {
  describe('resize directive', function() {
    var $compile, $rootScope, $window;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$window_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $window = _$window_;
    }));

    it('shoud trigger resize twice', function() {
      $rootScope.switchLayoutMode = function() {
        console.log('switchLayoutMode is triggeded');
      };
      var renderHtml = $compile('<div class="main-content container-fluid" ng-hide="!enabled" resize="switchLayoutMode()">')($rootScope);
      $rootScope.$digest();
      $window.innerWidth = 1920;
      $rootScope.$digest();
    });
  });
});