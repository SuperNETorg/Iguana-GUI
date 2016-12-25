describe('lang filter test', function() {
  describe('lang filter', function() {
    var $filter;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it('shoud exist', function() {
      expect($filter('lang')).toBeDefined();
    });

    it('shoud display warning message', function() {
      var filterTest = $filter('lang')('LOGIN.TEST123');
      expect(filterTest).toEqual('{{ LOGIN.TEST123 }}');
      filterTest = $filter('lang')('TEST');
      expect(filterTest).toEqual('{{ TEST }}');
    });
  });
});