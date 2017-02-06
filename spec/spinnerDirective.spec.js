describe('spinner directive test', function() {
  describe('spinner directive', function() {
    var $compile, $rootScope;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('shoud render spinner visible', function() {
      var renderHtml = $compile('<div><spinner visibility="true"></spinner></div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual(fixture.load('spinner_html.json').visible);
    });

    it('shoud render spinner invisible', function() {
      var renderHtml = $compile('<div><spinner visibility="false"></spinner></div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual(fixture.load('spinner_html.json').invisible);
    });
  });
});