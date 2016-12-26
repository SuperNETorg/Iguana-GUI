describe('lang filter test', function() {
  describe('lang filter', function() {
    var $filter, $compile, $rootScope;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$filter_, _$compile_, _$rootScope_) {
      $filter = _$filter_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('shoud exist', function() {
      expect($filter('lang')).toBeDefined();
    });

    it('shoud display 2 warning messages', function() {
      var filterTest = $filter('lang')('LOGIN.TEST123');
      expect(filterTest).toEqual('{{ LOGIN.TEST123 }}');
      filterTest = $filter('lang')('TEST');
      expect(filterTest).toEqual('{{ TEST }}');
    });

    it('shoud display lang placeholder', function() {
      var filterTest = $filter('lang')('PAGE.LOGIN');
      expect(filterTest).toEqual('Login');
    });

    it('shoud render html w/ translation placeholder', function() {
      var renderHtml = $compile('<div>{{ \'PAGE.LOGIN\' | lang }}</div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div class="ng-binding ng-scope">Login</div>');
      $rootScope.$$watchers = [];
    });

    it('shoud fail to render html w/ translation placeholder', function() {
      var renderHtml = $compile('<div>{{ \'TEST2\' | lang }}</div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div class="ng-binding ng-scope">{{ TEST2 }}</div>');
    });
  });
});