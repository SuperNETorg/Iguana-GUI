describe('auth service test', function() {
  describe('auth', function() {
    var $api, $state, $storage, vars, util, $q, $httpBackend;
    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$api_, _$state_, _$storage_, _vars_, _util_, _$q_,_$httpBackend_) {
      $state = _$state_;
      $api = _$api_;
      $storage = _$storage_;
      $httpBackend = _$httpBackend_;
      vars = _vars_;
      util = _util_;
      $q = _$q_;

      vars.coinsInfo = {
        'btc': {
          connection: true,
          RT: true,
          relayFee: 0.00001
        }
      };
    }));

    it('shoud exist', inject(function($auth) {
      expect($auth).toBeDefined();
    }));

    it('shoud add btc coin (iguana)', inject(function($auth) {
      $auth.coinsSelectedToAdd = [{
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }];
      $auth.checkIguanaCoinsSelection().then(function(data) {
        expect($auth.addedCoinsOutput).toEqual('BTC');
        expect($storage['iguana-btc-passphrase']).toBeDefined();
        expect($storage['iguana-btc-passphrase'].logged).toEqual('yes');
      });

      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
        return [200, { result: 'coin added' }];
      });

      $httpBackend.flush();
    }));

    it('shoud fail to add btc, sys coin (iguana)', inject(function($auth) {
      vars.coinsInfo = {
        'btc': {
          connection: true,
          RT: true,
          relayFee: 0.00001
        },
        'sys': {
          connection: true,
          RT: false,
          relayFee: 0.00001
        }
      };

      $auth.coinsSelectedToAdd = [
        {
          coinId: 'btc',
          id: 'BTC',
          name: 'Bitcoin'
        }, {
          coinId: 'sys',
          id: 'SYS',
          name: 'Syscoin'
        }];
      $auth.checkIguanaCoinsSelection().then(function(data) {
        expect($auth.failedCoinsOutput).toEqual('BTC, SYS');
        expect($auth.addedCoinsOutput).toEqual('');
      });

      $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
        return [200, { result: 'server is busy' }];
      });

      $httpBackend.flush();
    }));

    it('shoud add btc coin w/o destroying session (iguana)', inject(function($auth) {
      $auth.coinsSelectedToAdd = [{
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }];
      $storage['iguana-btc-passphrase'] = { 'logged': 'random' };
      $storage['iguana-sys-passphrase'] = { 'logged': 'random' };
      $auth.checkIguanaCoinsSelection(true, true).then(function(data) {
        expect($storage['iguana-btc-passphrase'].logged).toEqual('yes');
        expect($storage['iguana-sys-passphrase'].logged).toEqual('random');
      });

      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
        return [200, { result: 'coin added' }];
      });

      $httpBackend.flush();
    }));

    it('shoud logout btc cb function', inject(function($auth) {
      $storage['iguana-btc-passphrase'] = { 'logged': 'yes' };
      $auth.coindWalletLockCount = 1;

      $auth.logoutCoindCB('btc');
      expect($storage['iguana-auth'].timestamp).toEqual(1471620867);
      expect($storage['iguana-btc-passphrase'].logged).toEqual('no');
    }));

    it('shoud logout all coind', inject(function($auth) {
      $storage['iguana-btc-passphrase'] = { 'logged': 'yes' };
      $storage['iguana-auth'] = { timestamp: 1234 };
      $auth.coindWalletLockCount = 1;

      $auth.logoutCoind();
      expect($storage['iguana-auth'].timestamp).toEqual(1471620867);
      expect($storage['iguana-btc-passphrase'].logged).toEqual('no');
    }));

    it('shoud login btc wallet (iguana)', inject(function($auth) {
      $storage.isIguana = true;
      delete $storage['iguana-btc-passphrase'];
      delete $storage['iguana-sys-passphrase'];
      delete $storage['iguana-auth'];
      var coinsSelectedToAdd = {
        'btc': {
          coinId: 'btc',
          id: 'BTC',
          name: 'Bitcoin'
        }
      };
      $auth.login(coinsSelectedToAdd, '123');
      expect($storage['iguana-auth']).not.toBeDefined();
      //expect($storage['iguana-auth'].timestamp).toBeGreaterThan(1);
      expect($storage['iguana-btc-passphrase'].logged).toEqual('no');
      expect($storage['dashboard-logged-in-coins'].btc).toEqual({
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      });

      $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
        return [200, { result: 'coin added' }];
      });
      $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/encryptwallet').respond(function(method, url, data) {
        return [200, { result: '' }];
      });
      $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/walletlock').respond(function(method, url, data) {
        return [200, { result: '' }];
      });
      $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/walletpassphrase').respond(function(method, url, data) {
        return [200, { result: '' }];
      });

      $httpBackend.flush();
    }));

    it('shoud login btc wallet (coind)', inject(function($auth) {
      $storage.isIguana = false;
      delete $storage['iguana-btc-passphrase'];
      delete $storage['iguana-sys-passphrase'];
      delete $storage['dashboard-logged-in-coins'];
      var coinsSelectedToAdd = {
        'btc': {
          coinId: 'btc',
          id: 'BTC',
          name: 'Bitcoin'
        }
      };
      $auth.login(coinsSelectedToAdd, '123').then(function(data) {
        expect($storage['iguana-auth'].timestamp).toBeGreaterThan(1);
        expect($storage['iguana-btc-passphrase'].logged).toEqual('yes');
      });

      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        return [200, { result: '' }];
      });
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        return [200, { result: '' }];
      });

      $httpBackend.flush();
    }));

    it('shoud check if current session is valid (coind)', inject(function($auth) {
      delete $storage['iguana-auth'];
      $storage.isIguana = false;
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours());
      $storage['iguana-auth'] = { 'timestamp': currentDate };
      var session = $auth._userIdentify();
      expect(session).toEqual(true);
    }));

    it('shoud return false on session check (iguana)', inject(function($auth) {
      delete $storage['iguana-auth'];
      $storage.isIguana = true;
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 3);
      $storage['iguana-auth'] = { 'timestamp': currentDate };
      var session = $auth._userIdentify();
      expect(session).toEqual(false);
    }));

    it('shoud return false on session check (coind)', inject(function($auth) {
      delete $storage['iguana-auth'];
      $storage.isIguana = false;
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 32 * 24); // 32 days
      $storage['iguana-auth'] = { 'timestamp': currentDate };
      var session = $auth._userIdentify();
      expect(session).toEqual(false);
    }));

    it('shoud check if current session is valid #2 (coind)', inject(function($auth) {
      delete $storage['iguana-auth'];
      $storage.isIguana = false;
      $auth.toState = { name: 'dashboard' };
      $auth.toParams = '';
      $auth.fromState = { name: 'login' };
      $auth.fromParams = '';
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours());
      $storage['iguana-auth'] = { 'timestamp': currentDate };
      var session = $auth.checkSession(true);
      expect(session).toEqual(true);
    }));
  });
});