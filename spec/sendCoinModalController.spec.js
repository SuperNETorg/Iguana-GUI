describe('sendCoinModal controller test', function() {
  beforeEach(module('IguanaGUIApp'));
  beforeEach(module('templates'));

  var $controller, $state, $auth, util, $window, $templateCache, $message, $api, $q, $rates, $uibModalInstance = {}, receivedObject,
      $compile, $rootScope, $storage, $httpBackend, vars, dashboardTemplate, compiledTemplate, pristineTemplate = {}, type;

  function testAsync(done) {
    setTimeout(function () {
      done();
    }, 100);
  }

  beforeEach(inject(function(_$controller_, _$state_, _$auth_, _util_, _$window_, _$uibModal_, _$message_, _$api_,
                             _$templateCache_, _$compile_, _$rootScope_, _$storage_, _$httpBackend_, _vars_, _$q_, _$rates_, _$rates_) {

    $controller = _$controller_;
    $state = _$state_;
    $auth = _$auth_;
    util = _util_;
    $window = _$window_;
    $templateCache = _$templateCache_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $storage = _$storage_;
    $httpBackend = _$httpBackend_;
    vars = _vars_;
    $uibModal = _$uibModal_;
    $rates = _$rates_;
    $message = _$message_;

    vars.coinsInfo = {
      'btc': {
        connection: true,
        RT: true,
        relayFee: 0.00001
      }
    };

    $storage['iguana-active-coin'] = { id: 'btc' };
    $storage['iguana-btc-passphrase'] = { 'logged': 'yes' };

    // load and render template
    // merge and compile two templates
    dashboardTemplate = $templateCache.get('partials/send-coin-entry.html');
    angular.element(document.body).prepend('<div id="templatePreCompile">' + dashboardTemplate + '</div>');
    var templateScript1 = document.getElementsByTagName('script')[0].innerHTML;
    dashboardTemplate = $templateCache.get('partials/send-coin-confirmation.html');
    angular.element(document.body).prepend('<div id="templatePreCompile">' + dashboardTemplate + '</div>');
    var templateScript2 = document.getElementsByTagName('script')[0].innerHTML;
    compiledTemplate = $compile(templateScript1 + templateScript2)($rootScope);

    // "lock" object from changes
    for (var i=0; i < Object.keys(compiledTemplate).length; i++) {
      var templateToHtml = angular.element(compiledTemplate[i]).html();
      if (templateToHtml) {
        Object.defineProperty(pristineTemplate, 'template' + i, {
          value: templateToHtml,
          writable: false
        });
      }
    }

    $uibModalInstance = {
      close: function() {
        console.log('close()');
      },
      open: function() {
        console.log('open()');
      },
      dismiss: function() {
        console.log('dismiss()');
      },
      closed: {
        then: function(confirmCallback, cancelCallback) {
          console.log('modal closed.then');
          confirmCallback();
        }
      }
    };

    var fakeModal = {
      result: {
        then: function(confirmCallback, cancelCallback) {
          console.log('modal opened');
          confirmCallback(true);
          this.confirmCallBack = confirmCallback;
          this.cancelCallback = cancelCallback;
        }
      },
      close: function(item) {
        this.result.confirmCallBack(item);
      },
      dismiss: function(type) {
        this.result.cancelCallback(type);
      },
      closed: {
        then: function(confirmCallback, cancelCallback) {
          console.log('modal closed.then');
          confirmCallback();
        }
      }
    };

    spyOn($uibModal, 'open').and.returnValue(fakeModal);
    spyOn($uibModalInstance, 'open').and.returnValue(fakeModal);

    $storage.isIguana = false;
    $storage.feeSettings = fixture.load('btc_fee_settings.json').feeSettings;
    $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
      //expect(JSON.parse(data).method).toEqual('getbalance');
      return [200, { result: '99c07b2177f6f13b221d47d2b263e39dbe9ed90fed5d3b80aa71fcefd87bd9c2' }];
    });

    var recommendedFeesFixture = fixture.load('btc_recommended_fees.json');
    $httpBackend.expectGET('https://bitcoinfees.21.co/api/v1/fees/recommended');
    $httpBackend.whenGET('https://bitcoinfees.21.co/api/v1/fees/recommended').respond(function(method, url, data) {
      return [200, recommendedFeesFixture]
    });

    var allFeesFixture = fixture.load('btc_fees_all.json');
    $httpBackend.expectGET('https://bitcoinfees.21.co/api/v1/fees/list');
    $httpBackend.whenGET('https://bitcoinfees.21.co/api/v1/fees/list').respond(function(method, url, data) {
      return [200, allFeesFixture]
    });

    $httpBackend.expectGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD');
    $httpBackend.whenGET('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').respond(function(method, url, data) {
      return [200, { 'BTC': {
                        'USD': 787.52
                      }
                    }]
    });
  }));

  // this should verify that placeholders are set in lang file and rendered correctly
  it('should verify send coin modal template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    for (var i=0; i < 1; i++) {
      if (pristineTemplate['template' + i]) {
        var langPlaceholders = pristineTemplate['template' + i].match(/{{ (.*) }}/g),
            placeholder2match = [],
            index = 0;
        for (var j=0; j < langPlaceholders.length; j++) {
          var renderedPlaceholder = $compile('<div>' + langPlaceholders[j] + '</div>')($rootScope);
          $rootScope.$digest();
          if (langPlaceholders[j].indexOf(' | lang') > -1 && langPlaceholders[j].indexOf(' : ') === -1) {
            var placeholder = langPlaceholders[j].match(/'(.*)'/g);
            placeholder2match.push({ rendered: renderedPlaceholder[0], plain: placeholder[0].replace(/'/g, '') });
            var langObjSplit = placeholder2match[index].plain.split('.');
            expect(lang.EN[langObjSplit[0]][langObjSplit[1]]).toBeDefined();
            expect(placeholder2match[index].rendered.innerHTML.trim()).toEqual(lang.EN[langObjSplit[0]][langObjSplit[1]].trim());
            index++;
          }
        }
      }
    }
  });

  it('should test close()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $scope.close();
  });

  it('should check $scope vars', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $scope.dropDown = {};

    $httpBackend.flush();

    expect($scope.dropDown.items).toEqual($storage.feeSettings.items);
    expect($scope.sendCoin.checkedAmountType).toEqual('Minimum');
    expect($scope.activeCoin).toEqual('btc');
  });

  it('should test onChange()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();

    $scope.items = {
      id: 0,
      name: lang.EN['SEND']['FEE_MIN'],
      coin: 0.00001,
      amount: (700 * 0.00001),
      feeMinTime: 10,
      feeMaxTime: 20
    };
    $scope.checkModel = { type: JSON.stringify($scope.items) };
    $scope.sendCoin.coinId = 'BTC';
    $scope.sendCoin.currency = 'USD';
    // test 1
    $scope.change();
    expect($scope.checkedAmountType).toEqual('Minimum');
    expect($scope.sendCoin.fee).toEqual($scope.items.coin);
    expect($scope.sendCoin.feeCurrency).toEqual($scope.items.amount);
    expect($scope.feeAllText).toEqual($scope.items.coin + ' ' + $scope.sendCoin.coinId);
    expect($scope.feeCurrencyAllText).toEqual($scope.items.amount + ' ' + $scope.sendCoin.currency);
    $scope.items = {
      id: 0,
      name: 'Custom',
      coin: 0.00001,
      amount: (700 * 0.00001),
      feeMinTime: 10,
      feeMaxTime: 20
    };
    $scope.checkModel = { type: JSON.stringify($scope.items) };
    // test custom fee option
    $scope.change();
    expect($scope.checkedAmountType).toEqual('Custom');
    expect($scope.sendCoin.fee).toEqual('');
    expect($scope.sendCoin.feeCurrency).toEqual('');
    expect($scope.feeAllText).toEqual(' ' + $scope.sendCoin.coinId);
    expect($scope.feeCurrencyAllText).toEqual(' ' + $scope.sendCoin.currency);
  });

  it('should test defaultChange()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();

    $httpBackend.flush();

    expect($scope.dropDown.items).toEqual($storage.feeSettings.items);
    expect($scope.sendCoin.checkedAmountType).toEqual('Minimum');
    expect($scope.activeCoin).toEqual('btc');
    expect($scope.sendCoin.fee).toEqual('0.0000100');
    expect($scope.sendCoin.feeCurrency).toEqual('0.010234300000');
    $scope.karma.defaultChange($storage.feeSettings.items[3].name);
    expect($scope.sendCoin.fee).toEqual($storage.feeSettings.items[3].coin);
    expect($scope.sendCoin.feeCurrency).toEqual($storage.feeSettings.items[3].amount);
  });

  it('should test openSendCoinPassphraseModal()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();

    $scope.openSendCoinPassphraseModal();
  });

  it('should test openSendCoinPassphraseModal() and fire execSendCoinCall()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();

    $httpBackend.flush();

    $scope.openSendCoinPassphraseModal();
  });

  it('should test sendCoinConfirm() coind', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $scope.isIguana = false;

    $httpBackend.flush();

    $scope.sendCoinFormConfirm();
  });

  it('should test sendCoinConfirm() iguana', function() {
    $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/sendtoaddress').respond(function(method, url, data) {
      return [200, { result: '99c07b2177f6f13b221d47d2b263e39dbe9ed90fed5d3b80aa71fcefd87bd9c2' }];
    });

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $storage.isIguana = true;

    $scope.sendCoinFormConfirm();

    $httpBackend.flush();
  });

  it('should test initSendCoinModal()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();

    $rates.updateRates = function(coin, currency, returnVal) {
      return 700;
    };

    expect($scope.sendCoin.currencyRate).not.toBeDefined();
    expect($scope.sendCoin.initStep).toEqual(true);
    expect($scope.sendCoin.currency).not.toBeDefined();
    expect($scope.sendCoin.coinName).not.toBeDefined();
    expect($scope.sendCoin.coinId).not.toBeDefined();
    expect($scope.sendCoin.coinValue).not.toBeDefined();
    expect($scope.sendCoin.currencyValue).not.toBeDefined();
    $scope.karma.initSendCoinModal(10, 'btc');
    expect($scope.sendCoin.currencyRate).toEqual(700);
    expect($scope.sendCoin.initStep).toEqual(-1);
    expect($scope.sendCoin.currency).toEqual('USD');
    expect($scope.sendCoin.coinName).toEqual('Bitcoin');
    expect($scope.sendCoin.coinId).toEqual('BTC');
    expect($scope.sendCoin.coinValue).toEqual(10);
    expect($scope.sendCoin.currencyValue).toEqual(7000);
  });

  it('should test sendCoinKeyingAmount()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.sendCoin = {
      amount: 1,
      currencyRate: 700
    };
    $scope.sendCoinKeyingAmount();
    expect($scope.sendCoin.amountCurrency).toEqual('700');
    $scope.sendCoin = {
      amount: 0.0001,
      currencyRate: 700
    };
    $scope.sendCoinKeyingAmount();
    expect($scope.sendCoin.amountCurrency).toEqual('0.07');
    $scope.sendCoin = {
      amount: 0.000001,
      currencyRate: 700
    };
    $scope.sendCoinKeyingAmount();
    expect($scope.sendCoin.amountCurrency).toEqual('0.0007');
  });

  it('should test sendCoinKeyingAmountCurrency()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.sendCoin = {
      amountCurrency: 1,
      currencyRate: 700
    };
    $scope.sendCoinKeyingAmountCurrency();
    expect($scope.sendCoin.amount).toEqual('0.0014285714285714286');
    $scope.sendCoin = {
      amountCurrency: 0.07,
      currencyRate: 700
    };
    $scope.sendCoinKeyingAmountCurrency();
    expect($scope.sendCoin.amount).toEqual('0.0001');
    $scope.sendCoin = {
      amountCurrency: 0.0007,
      currencyRate: 700
    };
    $scope.sendCoinKeyingAmountCurrency();
    expect($scope.sendCoin.amount).toEqual('0.000001');
  });

  it('should test sendFee()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $scope.sendCoin = {
      fee: 'a',
      currencyRate: 'b'
    };
    $scope.sendFee();
    expect($scope.sendCoin.feeCurrency).toEqual('');
    $scope.sendCoin = {
      fee: 1,
      currencyRate: 700
    };
    $scope.sendFee();
    expect($scope.sendCoin.feeCurrency).toEqual('700.0000000');
  });

  it('should test sendFeeCurrency()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $scope.sendCoin = {
      feeCurrency: 'a',
      currencyRate: 'b'
    };
    $scope.sendFeeCurrency();
    expect($scope.sendCoin.fee).toEqual('');
    $scope.sendCoin = {
      feeCurrency: 1,
      currencyRate: 700
    };
    $scope.sendFeeCurrency();
    expect($scope.sendCoin.fee).toEqual(0.0014285714285714286);
  });

  it('should test validateSendCoinForm()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.sendCoin.initStep = true;
    // #1
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.initStep).toEqual(true);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #2
    $scope.sendCoin.address = '';
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.address).toEqual(false);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #2.1
    $scope.sendCoin.address = 'as21fsdfwef';
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.address).toEqual(false);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #2.2
    $scope.sendCoin.address = 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d';
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.address).toEqual(true);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #3
    $scope.sendCoin.coinValue = 0.5;
    $scope.sendCoin.amount = 1;
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.amount.empty).toEqual(true);
    expect($scope.sendCoin.valid.amount.notEnoughMoney).toEqual(false);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #3.1
    $scope.sendCoin.coinValue = '2';
    $scope.sendCoin.amount = '1';
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.amount.empty).toEqual(false);
    expect($scope.sendCoin.valid.amount.notEnoughMoney).toEqual(false);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #4
    $scope.sendCoin.fee = '2';
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.fee.empty).toEqual(false);
    expect($scope.sendCoin.valid.fee.notEnoughMoney).toEqual(true);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #4.1
    $scope.sendCoin.minFee = '0.001';
    $scope.sendCoin.fee = '0.000001';
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.fee.notEnoughMoney).toEqual(false);
    expect($scope.sendCoin.valid.fee.empty).toEqual(true);
    expect($scope.sendCoin.entryFormIsValid).toEqual(false);
    // #4.2
    $scope.sendCoin.minFee = '0.001';
    $scope.sendCoin.fee = '0.02';
    $scope.sendCoin.currencyRate = 700;
    $scope.validateSendCoinForm();
    expect($scope.sendCoin.valid.fee.notEnoughMoney).toEqual(false);
    expect($scope.sendCoin.valid.fee.empty).toEqual(false);
    expect($scope.sendCoin.entryFormIsValid).toEqual(true);
    expect($scope.sendCoin.amountCurrency).toEqual(700);
    expect($scope.sendCoin.feeCurrency).toEqual('14.000000000000');
    expect($scope.sendCoin.initStep).toEqual(false);
  });

  it('should test execSendCoinCall() and add transaction fee', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.sendCoin.fee = 1;
    $scope.sendCoin.initStep = true;
    $scope.sendCoin.address = 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d';
    $scope.sendCoin.amount = 1;
    $scope.sendCoin.note = 'karma test';

    $scope.karma.execSendCoinCall();
    $httpBackend.flush();
    expect($scope.sendCoin.success).toEqual(true);
  });

  it('should test execSendCoinCall() w/ default transation fee', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('sendCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.sendCoin.initStep = true;
    $scope.sendCoin.address = 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d';
    $scope.sendCoin.amount = 1;
    $scope.sendCoin.note = 'karma test';

    $scope.karma.execSendCoinCall();
    $httpBackend.flush();
    expect($scope.sendCoin.success).toEqual(true);
  });
});