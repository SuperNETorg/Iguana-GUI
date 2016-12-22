describe('rates service test', function() {
  describe('rates', function() {
    var $api, $storage, vars, $httpBackend, $http, q, rates;
    $storage = [];

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$storage_, _vars_, _$httpBackend_, _$rates_){
      $storage = _$storage_;
      vars = _vars_;
      $httpBackend = _$httpBackend_;
      rates = _$rates_;
      // prep test env
      $storage['iguana-btc-passphrase'] = { logged: 'yes' };
      vars.coinsInfo = {
        'btc': {
          connection: true
        }
      };
    }));

    function testAsync(done) {
      setTimeout(function () {
        done();
      }, 100);
    }

    it('shoud exist', inject(function($rates) {
      expect($rates).toBeDefined();
    }));

    it('shoud return difference between now and rate timestamp', inject(function($rates) {
      $storage['iguana-rates-btc'] = { shortName: 'USD', value: 787.52, updatedAt: 0 };
      var currentDate = new Date();

      currentDate.setHours(currentDate.getHours() - 1);
      $storage['iguana-rates-btc'].updatedAt = currentDate;

      expect(Math.abs(Math.floor($rates.ratesUpdateElapsedTime('btc')))).toEqual(3600);
    }));

    it('shoud update BTC/USD rate from an external website', inject(function($rates) {
      $httpBackend.expect('GET', 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
      $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond(function(method, url, data) {
        return [200, { 'BTC': { 'USD': 787.52 } } ];
      });

      $rates.updateRates(null, null, null, true);

      $httpBackend.flush();

      expect($storage['iguana-rates-btc'].shortName).toEqual('USD');
      expect($storage['iguana-rates-btc'].value).toEqual(787.52);
    }));

    it('shoud skip to update BTC/USD rate from an external website', inject(function($rates) {
      $storage['iguana-rates-btc'] = { shortName: 'USD', value: 787.52, updatedAt: new Date().setHours(new Date().getHours() + 10) };
      $rates.updateRates('btc'); // should use localstorage rate

      expect($storage['iguana-rates-btc'].shortName).toEqual('USD');
      expect($storage['iguana-rates-btc'].value).toEqual(787.52);
    }));

    // async strategy is required
    describe('async get localstrorage rate', function () {
      beforeEach(function (done) {
        $httpBackend.expect('GET', 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
        $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond(function(method, url, data) {
          return [200, { 'BTC': { 'USD': 787.52 } } ];
        });

        rates.updateRates(null, null, null, true);
        $httpBackend.flush();
        testAsync(done);
      });

      it('shoud retrieve localstrorage BTC/USD rate', inject(function($rates) {
        var btcRate = $rates.updateRates('btc', null, true);

        expect(btcRate).toEqual(787.52);
      }));

      it('shoud retrieve localstrorage BTC/USD rate using shorthand function', inject(function($rates) {
        var btcRate = $rates.getRate('btc', true);

        expect(btcRate).toEqual(787.52);
      }));
    });

    it('shoud fail to query coin/currency rate from both external websites', inject(function($rates) {
      $storage = [];
      $storage['iguana-ltc-passphrase'] = { logged: 'yes' };

      $httpBackend.expect('GET', 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
      $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond(function(method, url, data) {
        return [502, 'fallback'];
      });
      $httpBackend.expectGET('http://api.cryptocoincharts.info/tradingPair/btc_usd');
      $httpBackend.whenGET('http://api.cryptocoincharts.info/tradingPair/btc_usd').respond(function(method, url, data) {
        return [502, 'fallback'];
      });

      $rates.updateRates(null, null, null, true);

      expect($storage['iguana-rates-btc']).not.toBeDefined();
      expect($storage['iguana-rates-ltc']).not.toBeDefined();

      $httpBackend.flush();
    }));

  });
});