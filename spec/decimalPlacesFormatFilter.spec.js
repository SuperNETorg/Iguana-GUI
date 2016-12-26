describe('decimalPlacesFormat filter test', function() {
  describe('decimalPlacesFormat filter', function() {
    var $filter, $compile, $rootScope;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$filter_, _$compile_, _$rootScope_) {
      $filter = _$filter_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('shoud exist', function() {
      expect($filter('decimalPlacesFormat')).toBeDefined();
    });

    it('shoud return undefined', function() {
      var decimalPlacesFormat = $filter('decimalPlacesFormat')();
      expect(decimalPlacesFormat).not.toBeDefined();
    });

    it('shoud return formatted values', function() {
      var decimalPlacesFormat = $filter('decimalPlacesFormat')(10.10, 'coin');
      expect(decimalPlacesFormat).toEqual('10.1');
      decimalPlacesFormat = $filter('decimalPlacesFormat')(10.10, 'currency');
      expect(decimalPlacesFormat).toEqual('10.10');
      decimalPlacesFormat = $filter('decimalPlacesFormat')(10.0, 'currency');
      expect(decimalPlacesFormat).toEqual('10');
      decimalPlacesFormat = $filter('decimalPlacesFormat')(0.000120000, 'coin');
      expect(decimalPlacesFormat).toEqual('0.00012');
      decimalPlacesFormat = $filter('decimalPlacesFormat')(0.000131, 'coin');
      expect(decimalPlacesFormat).toEqual('0.000131');
      decimalPlacesFormat = $filter('decimalPlacesFormat')(0.000131001, 'coin');
      expect(decimalPlacesFormat).toEqual('0.000131001');
    });

    it('shoud render html w/ formatted values', function() {
      var renderHtml = $compile('<div>{{ 10.29 | decimalPlacesFormat: \'coin\' }}</div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div class="ng-binding ng-scope">10.3</div>');
      renderHtml = $compile('<div>{{ 10.10001 | decimalPlacesFormat: \'currency\' }}</div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div class="ng-binding ng-scope">10.10</div>');
      renderHtml = $compile('<div>{{ 0.100010 | decimalPlacesFormat: \'currency\' }}</div>')($rootScope);
      $rootScope.$digest();
      expect(renderHtml['0'].outerHTML).toEqual('<div class="ng-binding ng-scope">0.10001</div>');
    });
  });
});