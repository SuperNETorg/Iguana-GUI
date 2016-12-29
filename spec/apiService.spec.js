// TODO: add more iguana mode test coverage

describe('api service test', function() {
  describe('api', function() {
    var $storage, vars, $httpBackend, $message;
    $storage = [];

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$storage_, _vars_, _$httpBackend_, _$message_) {
      $storage = _$storage_;
      vars = _vars_;
      $httpBackend = _$httpBackend_;
      $message = _$message_;
      // prep test env
      $storage['iguana-btc-passphrase'] = { logged: 'yes' };
      vars.coinsInfo = {
        'btc': {
          connection: true
        }
      };
    }));

    it('shoud exist', inject(function($api) {
      expect($api).toBeDefined();
    }));

    it('shoud get external rate', inject(function($api) {
      $httpBackend.expectGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
      $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond({
        success: {
          'BTC': {
            'USD': 787.52
          }
        }
      });

      $api.getExternalRate('BTC/USD').then(function(data) {
        expect(data).toBeDefined();
        expect(data[0].success).toEqual({
          'BTC': {
            'USD': 787.52
          }
        });
      });

      $httpBackend.flush();
    }));

    it('shoud fallback to secondary rates source', inject(function($api) {
      $httpBackend.expectGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
      $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond(function(method, url, data) {
        return [502, 'fallback'];
      });
      $httpBackend.expectGET('http://api.cryptocoincharts.info/tradingPair/btc_usd');
      $httpBackend.whenGET('http://api.cryptocoincharts.info/tradingPair/btc_usd').respond(function(method, url, data) {
        return [502, 'fallback'];
      });

      $api.getExternalRate('BTC/USD').then(function(data) {});

      $httpBackend.flush();
    }));

    it('shoud get recommended btc fees', inject(function($api) {
      var recommendedFeesFixture = fixture.load('btc_recommended_fees.json');

      $httpBackend.expectGET('https://bitcoinfees.21.co/api/v1/fees/recommended');
      $httpBackend.whenGET('https://bitcoinfees.21.co/api/v1/fees/recommended').respond({
        success: recommendedFeesFixture
      });

      $api.bitcoinFees().then(function(data) {
        expect(data).toBeDefined();
        expect(data.data.success).toEqual(recommendedFeesFixture);
      });

      $httpBackend.flush();
    }));

    it('shoud get recommended btc fees all', inject(function($api) {
      var allFeesFixture = fixture.load('btc_fees_all.json');

      $httpBackend.expectGET('https://bitcoinfees.21.co/api/v1/fees/list');
      $httpBackend.whenGET('https://bitcoinfees.21.co/api/v1/fees/list').respond({
        success: allFeesFixture
      });

      $api.bitcoinFeesAll().then(function(data) {
        expect(data).toBeDefined();
        expect(data.data.success).toEqual(allFeesFixture);
      });

      $httpBackend.flush();
    }));

    it('shoud get 10 btc balance (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getbalance');
        return [200, 10];
      });

      $api.getBalance('', 'btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual([10, 'btc']);
      });

      $httpBackend.flush();
    }));

    it('shoud get 0 btc balance (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getbalance');
        return [200, 0];
      });

      $api.getBalance('', 'btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual([0, 'btc']);
      });

      $httpBackend.flush();
    }));

    it('shoud respond w/ 502 error (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getbalance');
        return [502, 'error'];
      });

      $api.getBalance('', 'btc').then(function(data) {
        expect(data).toEqual(false);
      });

      $httpBackend.flush();
    }));

    it('shoud respond w/ 401 error (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getbalance');
        return [401, 'error'];
      });

      $api.getBalance('', 'btc').then(function(data) {
        expect(data).toEqual(false);
      });

      $httpBackend.flush();
    }));

    it('shoud get coin balance (iguana)', inject(function($api) {
      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/getbalance').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getbalance');
        return [200, 10];
      });

      $api.getBalance('', 'btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual([10, 'btc']);
      });

      $httpBackend.flush();
    }));

    it('shoud listtransactions btc 2 tx (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('listtransactions');
        return [200, { result: fixture.load('btc_listtransactions_2.json') }];
      });

      $api.listTransactions('', 'btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data.length).toEqual(2);
        expect(data[0].address).toEqual('15K5spF7woSF4rzGsQWSLVttmCF1nGGDXe');
        expect(data[0].category).toEqual('send');
        expect(data[1].address).toEqual('1FG5qwZRcxVtx7CgqgtWLdBo17sErvpu6');
        expect(data[1].category).toEqual('send');
      });

      $httpBackend.flush();
    }));

    it('shoud listtransactions btc 14 tx (iguana)', inject(function($api) {
      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/listtransactions').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('listtransactions');
        return [200, { result: fixture.load('btc_listtransactions_20.json') }];
      });

      $api.listTransactions('', 'btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data.length).toEqual(14);
        expect(data[0].address).toEqual('1G7GjuQx3krot5LYkphcXM4mhnmXi8Er9U');
        expect(data[0].category).toEqual('receive');
        expect(data[1].address).toEqual('1G7GjuQx3krot5LYkphcXM4mhnmXi8Er9U');
        expect(data[1].category).toEqual('receive');
      });

      $httpBackend.flush();
    }));

    it('shoud settxfee 0.1 btc (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('settxfee');
        return [200, { result: true }];
      });

      $api.setTxFee('btc', 0.1).then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual(true);
      });

      $httpBackend.flush();
    }));

    it('shoud sendtoaddress 0.1 btc (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).params).toEqual([
          'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d',
          0.1,
          'test note'
        ]);
        expect(JSON.parse(data).method).toEqual('sendtoaddress');
        return [200, { result: '99c07b2177f6f13b221d47d2b263e39dbe9ed90fed5d3b80aa71fcefd87bd9c2' }];
      });

      $api.sendToAddress('btc', {
        address: 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d',
        amount: 0.1,
        note: 'test note'
      })
      .then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual('99c07b2177f6f13b221d47d2b263e39dbe9ed90fed5d3b80aa71fcefd87bd9c2');
      });

      $httpBackend.flush();
    }));

    it('shoud get sys api route (coind)', inject(function($api) {
      $storage.isIguana = false;

      var apiRoute = $api.getFullApiRoute('settxfee', null, 'sys');
      expect(apiRoute).toEqual('http://localhost:1337/localhost:8368');
    }));

    it('shoud get sys api route (iguana)', inject(function($api) {
      $storage.isIguana = true;

      var apiRoute = $api.getFullApiRoute('settxfee', null, 'sys');
      expect(apiRoute).toEqual('http://localhost:7778/api/bitcoinrpc/settxfee');
    }));

    it('shoud get bitcoinrpc POST object (coind)', inject(function($api) {
      $storage.isIguana = false;

      var rpcPayload = $api.getBitcoinRPCPayloadObj('settxfee', [0.1], 'sys');
      expect(JSON.parse(rpcPayload).agent).toEqual('bitcoinrpc');
      expect(JSON.parse(rpcPayload).method).toEqual('settxfee');
      expect(JSON.parse(rpcPayload).timeout).toEqual('2000');
      expect(JSON.parse(rpcPayload).params).toEqual([0.1]);
    }));

    it('shoud get bitcoinrpc POST object (iguana)', inject(function($api) {
      $storage.isIguana = true;

      var rpcPayload = $api.getBitcoinRPCPayloadObj('settxfee', [0.1], 'sys');
      expect(JSON.parse(rpcPayload).coin).toEqual('SYS');
      expect(JSON.parse(rpcPayload).method).toEqual('settxfee');
      expect(JSON.parse(rpcPayload).immediate).toEqual('1000');
      expect(JSON.parse(rpcPayload).params).toEqual([0.1]);
    }));

    it('shoud get basic authorization object (coind)', inject(function($api) {
      $storage.isIguana = false;

      var basicAutorization = $api.getBasicAuthHeaderObj(null, 'sys');
      expect(basicAutorization.Authorization).toEqual('Basic dXNlcjpwYXNz');
    }));


    it('shoud get server url (iguana)', inject(function($api) {
      var serverUrl = $api.getServerUrl();
      expect(serverUrl).toEqual('http://localhost:7778/api/');
    }));

    it('shoud add sys coin (iguana)', inject(function($api) {
      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
        return [200, { result: 'coin added' }];
      });

      $api.addCoins([{
        coinId: 'sys',
        id: 'SYS',
        name: 'Syscoin'
      }], 0)
      .then(function(data) {
        expect(data[0][1].data.result).toEqual('coin added');
        expect(data[0][0]).toEqual('sys');
        expect(data[0][1].config.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
        expect(JSON.parse(data[0][1].config.data).newcoin).toEqual('SYS'); // check iguana addcoin obj
        expect(JSON.parse(data[0][1].config.data).rpc).toEqual(8370);
      });

      $httpBackend.flush();
    }));

    it('shoud fail to add sys coin (iguana)', inject(function($api) {
      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
        return [500, { result: 'server is busy' }];
      });

      $api.addCoins([{
        coinId: 'sys',
        id: 'SYS',
        name: 'Syscoin'
      }], 0)
      .then(function(data) {
        expect(data[0][1].data.result).toEqual('server is busy');
        expect(data[0][0]).toEqual(false);
      });

      $httpBackend.flush();
    }));

    it('shoud getaccountaddress btc (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).params).toEqual(['']);
        expect(JSON.parse(data).method).toEqual('getaccountaddress');
        return [200, { result: 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d' }];
      });

      $api.getAccountAddress('btc', '').then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual('mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d');
      });

      $httpBackend.flush();
    }));

    it('shoud get sys conf object (coind)', inject(function($api) {
      $storage.isIguana = false;

      var conf = $api.getConf(false, 'sys');
      expect(conf.server.port).toEqual(8368);
    }));

    it('shoud get default iguana conf object', inject(function($api) {
      $storage.isIguana = false;

      var conf = $api.getConf(false, null);
      expect(conf.server.port).toEqual('7778');
    }));

    it('shoud check btc sync status (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getblocktemplate');
        var blockTemplate = fixture.load('btc_getblocktemplate.json');
        blockTemplate.bits = 1;
        return [200, { result: blockTemplate }];
      });

      $api.coindCheckRT('btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual(true);
      });

      $httpBackend.flush();
    }));

    it('shoud check btc sync in progress status (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('getblocktemplate');
        // code -10 can correspond to a number of "out of sync" states
        return [502, {
          result: 'someresult',
          responseText: 'code:-10'
        }];
      });

      $api.coindCheckRT('btc').then(function(data) {
        expect(data).toBeDefined();
        expect(data).toEqual(false);
      });

      $httpBackend.flush();
    }));

    it('shoud walletpassphrase btc wallet (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('walletpassphrase');
        return [200, {
          result: '',
          error: ''
        }];
      });

      $api.walletLogin('test test', 3600, 'btc').then(function(data) {
        expect(data).toBeDefined();
        // for safety purposes coind walletpassphrase timeout value should be overridden to 3s
        expect(JSON.parse(data[0].config.data).params[1]).toEqual(3);
      });

      $httpBackend.flush();
    }));

    it('shoud respond with "wallet already unlocked" on walletpassphrase btc wallet (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('walletpassphrase');
        return [401, {
          error: {
            message: 'Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.'
          }
        }];
      });

      $api.walletLogin('test test', 3600, 'btc').then(function(data) {
        expect(data).toBeDefined();
        // for safety purposes coind walletpassphrase timeout value should be overridden to 3s
        expect(JSON.parse(data[0].config.data).params[1]).toEqual(3);
      });

      $httpBackend.flush();
    }));

    it('shoud respond w/ an error on wrong passphrase used in walletpassphrase btc wallet (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('walletpassphrase');
        return [401, {
          error: {
            message: 'Error: The wallet passphrase entered was incorrect'
          }
        }];
      });

      $api.walletLogin('test test', 3600, 'btc').then(function(data) {
        expect(data).toBeDefined();
        // for safety purposes coind walletpassphrase timeout value should be overridden to 3s
        expect(JSON.parse(data[0].config.data).params[1]).toEqual(3);
      });

      $httpBackend.flush();
    }));

    it('shoud error if unencrypted wallet is used on walletpassphrase btc wallet (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('walletpassphrase');
        return [401, {
          error: {
            message: 'Error: running with an unencrypted wallet, but walletpassphrase was called'
          }
        }];
      });

      $api.walletLogin('test test', 3600, 'btc').then(function(data) {
        expect(data).toBeDefined();
        // for safety purposes coind walletpassphrase timeout value should be overridden to 3s
        expect(JSON.parse(data[0].config.data).params[1]).toEqual(3);
      });

      $httpBackend.flush();
    }));

    it('shoud walletpassphrase btc (iguana)', inject(function($api) {
      $storage.isIguana = true;
      $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/walletpassphrase').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('walletpassphrase');
        return [200, {
          result: '',
          error: ''
        }];
      });

      $api.walletLogin('test test', 3600, 'btc').then(function(data) {
        expect(data).toBeDefined();
        expect(JSON.parse(data[0].config.data).params[1]).toEqual(3600);
      });

      $httpBackend.flush();
    }));

    it('shoud lockwallet btc (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('walletlock');
        return [200, {
          result: '',
          error: ''
        }];
      });

      $api.walletLock('btc').then(function(data) {
        expect(data).toBeDefined();
      });

      $httpBackend.flush();
    }));

    it('shoud encryptwallet btc (coind)', inject(function($api) {
      $storage.isIguana = false;
      $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
        expect(JSON.parse(data).method).toEqual('encryptwallet');
        return [200, {
          result: '',
          error: ''
        }];
      });

      $api.walletEncrypt('test test', 'btc').then(function(data) {
        expect(data).toBeDefined();
      });

      $httpBackend.flush();
    }));

    it('shoud test all coind ports w/ success (coind)', inject(function($api) {
      $storage.isIguana = false;
      var coins = $api.getConf().coins;
          btcGetinfoMock = fixture.load('btc_getinfo.json');

      for (var i in coins) {
        (function(x) {
          $httpBackend.whenPOST('http://localhost:1337/localhost:' + (coins[x].coindPort ? coins[x].coindPort : coins[x].portp2p)).respond(function(method, url, data) {
            return [200, { result: btcGetinfoMock }];
          });
        })(i);
      }

      $api.testCoinPorts().then(function(data) {
        expect(data).toBeDefined();
      });

      $httpBackend.flush();
    }));

    it('shoud fail to test any coind ports (coind)', inject(function($api) {
      $storage.isIguana = false;

      var coins = $api.getConf().coins;
          btcGetinfoMock = fixture.load('btc_getinfo.json');

      for (var i in coins) {
        (function(x) {
          $httpBackend.whenPOST('http://localhost:1337/localhost:' + (coins[x].coindPort ? coins[x].coindPort : coins[x].portp2p)).respond(function(method, url, data) {
            return [401, {
              result: '',
              error: ''
            }];
          });
        })(i);
      }

      $api.testCoinPorts().then(function(data) {
        expect(data).toBeDefined();
      });

      $httpBackend.flush();
    }));

    it('shoud error w/ 3 types of server errors (coind)', inject(function($api) {
      $storage.isIguana = false;

      var coins = $api.getConf().coins,
          errors = {
            8332: 'Bad Gateway',
            14632: 'Verifying blocks...'
          };

      for (var i in coins) {
        (function(x) {
          $httpBackend.whenPOST('http://localhost:1337/localhost:' + (coins[x].coindPort ? coins[x].coindPort : coins[x].portp2p)).respond(function(method, url, data) {
            return [401, { result: '', error: errors[coins[x].portp2p] ? errors[coins[x].portp2p] : '' }];
          });
        })(i);
      }

      $api.testCoinPorts().then(function(data) {
        expect(data).toBeDefined();
      });

      $httpBackend.flush();
    }));

    it('shoud get a list of all supported coins (coind)', inject(function($api) {
      $storage.isIguana = false;

      var globalCoinsLength = Object.keys(supportedCoinsList).length,
          localCoinsLength = Object.keys($api.getConf().coins).length;

      expect(localCoinsLength).toEqual(globalCoinsLength);
    }));

    it('shoud return 10 on errorHandler exec', inject(function($api) {
      $message.ngPrepMessageModal = function(text, color) {
        expect(text).toEqual('We\'re sorry but something went wrong while logging you in. Please try again. Redirecting...');
        expect(color).toEqual('red');
      };
      var errorHandler = $api.errorHandler({
        data: {
          error: {
            message: 'need to unlock wallet'
          }
        }
      }, 'btc');
      expect(errorHandler).toEqual(10);
    }));

    it('shoud return 10 on errorHandler exec #2', inject(function($api) {
      var errorHandler = $api.errorHandler({
        data: {
          error: 'iguana jsonstr expired'
        }
      }, 'btc');
      expect(errorHandler).toEqual(10);
    }));

    it('shoud return 10 on errorHandler exec #3', inject(function($api) {
      var errorHandler = $api.errorHandler({
        data: {
          error: 'coin is busy processing'
        }
      }, 'btc');
      expect(errorHandler).toEqual(10);
    }));

    it('shoud return 10 on errorHandler exec #4', inject(function($api) {
      $storage.activeCoin = 9999;
      $message.ngPrepMessageModal = function(text, color) {
        expect(text).toEqual('We\'re sorry but it seems that Iguana has crashed. Please login again. Redirecting...');
        expect(color).toEqual('red');
      };
      var errorHandler = $api.errorHandler({
        data: {
          error: 'null return from iguana_bitcoinRPC'
        }
      }, 'btc');
      expect(errorHandler).toEqual(10);
    }));

    it('shoud detect iguana', inject(function($api) {
      $storage.isIguana = true;

      $httpBackend.whenGET('http://localhost:7778/api/iguana/getconnectioncount').respond(function(method, url, data) {
        return [200, 10];
      });

      $api.testConnection().then(function(data) {
      });

      $httpBackend.flush();
    }));

    it('shoud detect coind', inject(function($api) {
      $storage.isIguana = false;

      $httpBackend.whenGET('http://localhost:7778/api/iguana/getconnectioncount').respond(function(method, url, data) {
        return [200, ''];
      });

      var coins = $api.getConf().coins;
          btcGetinfoMock = fixture.load('btc_getinfo.json');

      for (var i in coins) {
        (function(x) {
          $httpBackend.whenPOST('http://localhost:1337/localhost:' + (coins[x].coindPort ? coins[x].coindPort : coins[x].portp2p)).respond(function(method, url, data) {
            return [200, { result: btcGetinfoMock }];
          });
        })(i);
      }

      $api.testConnection().then(function(data) {
      });

      $httpBackend.flush();
    }));
  });
});