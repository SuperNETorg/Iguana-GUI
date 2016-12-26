describe('appTitle directive test', function() {
  describe('appTitle directive', function() {
    var $filter, $compile, $rootScope;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$filter_, _$compile_, _$rootScope_) {
      $filter = _$filter_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('shoud render appTitle', function() {
      $rootScope.toState = {
        data: {
          pageTitle: 'PAGE.LOGIN'
        }
      };
      var renderHtml = $compile('<div app-title></div>')($rootScope);
      $rootScope.$broadcast('$stateChangeStart');
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div app-title="" class="ng-scope">Iguana / Login</div>');

      $rootScope.toState = {
        data: {
          pageTitle: 'PAGE.DASHBOARD'
        }
      };
      var renderHtml = $compile('<div app-title></div>')($rootScope);
      $rootScope.$broadcast('$stateChangeStart');
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div app-title="" class="ng-scope">Iguana / Dashboard</div>');
    });
  });
});