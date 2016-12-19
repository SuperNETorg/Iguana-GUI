describe('rates service test', function() {
  describe('rates', function() {
    var $api, $storage, vars, $httpBackend, $http, q;

    beforeEach(module('IguanaGUIApp'));

    beforeEach(inject(function(_$api_, _$storage_, _vars_, _$httpBackend_, _$http_, _$q_){
      $api = _$api_;
      $storage = _$storage_;
      vars = _vars_;
      $http = _$http_;
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      // prep test env
      $storage['iguana-btc-passphrase'] = { logged: 'yes' };
    }));


    it('shoud exist', inject(function($rates) {
      expect($rates).toBeDefined();
    }));

/*
  $httpBackend.whenGET('/onmap/rest/map/uuid?editor=true').respond({
    success: {
      elements: [1, 2, 3]
    }
  });
*/

    it('shoud', inject(function($rates) {
      $storage['iguana-btc-passphrase'] = { logged: 'yes' };
      expect($rates).toBeDefined();
      vars.coinsInfo = { 'btc': { connection: true } };

      $httpBackend.expect('GET', 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
      $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond({
        success: {
          "BTC":{"USD":787.52}
        }
      });

      $rates.updateRates(null, null, null, true);

      console.log($api.getExternalRate('BTC/USD'));

      //console.log($rates.updateRates('BTC', 'USD', true));
      console.log($storage);
      /*$rates.updateRates('SYS', 'USD', null, true)
            .then(function(res))*/
      //expect($message.ngPrepMessageModal(null, 'red', 'noDaemon')).toEqual(jasmine.any(Object));
    }));

    /*it('shoud update BTC/USD rate', inject(function($rates) {
      vars.coinsInfo = { 'btc': { connection: true } };
      $rates.updateRateCB('BTC', { 'BTC': { 'USD': 787.52 } });
      expect($storage['iguana-rates-btc'].shortName).toEqual('USD');
      expect($storage['iguana-rates-btc'].value).toEqual(787.52);
    }));*/
  });
});