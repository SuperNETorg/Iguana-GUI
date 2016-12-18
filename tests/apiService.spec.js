describe('api service test', function() {
  describe('api', function() {
    var $storage, vars, $httpBackend;

    beforeEach(module('IguanaGUIApp'));

    beforeEach(inject(function(_$storage_, _vars_, _$httpBackend_){
      $storage = _$storage_;
      vars = _vars_;
      $httpBackend = _$httpBackend_;
      // prep test env
      $storage['iguana-btc-passphrase'] = { logged: 'yes' };
      $httpBackend.expectGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
      $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond({
        success: {
          'BTC': { 'USD': 787.52 }
        }
      });
    }));

    it('shoud exist', inject(function($rates) {
      expect($rates).toBeDefined();
    }));

    it('shoud get external rate', inject(function($api) {
      expect($api).toBeDefined();
      vars.coinsInfo = { 'btc': { connection: true } };

      $api.getExternalRate('BTC/USD').then(function(data) {
        expect(data).toBeDefined();
        expect(data[0].success).toEqual({ 'BTC': { 'USD': 787.52 } });
      });

      $httpBackend.flush();
    }));
  });
});