describe('dashboard controller test', function() {
  beforeEach(module('IguanaGUIApp'));
  beforeEach(module('templates'));

  var $controller, $state, $auth, util, $window, $templateCache, $message, $api, $q, $rates, $uibModalInstance = {}, receivedObject,
      $compile, $rootScope, $storage, $httpBackend, vars, dashboardTemplate, compiledTemplate, pristineTemplate = {}, type;

  beforeEach(inject(function(_$controller_, _$state_, _$auth_, _util_, _$window_, _$uibModal_, _$message_, _$api_,
                             _$templateCache_, _$compile_, _$rootScope_, _$storage_, _$httpBackend_, _vars_, _$q_, _$rates_) {

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
    $message = _$message_;
    $api = _$api_;
    $q = _$q_;
    $rates = _$rates_;

    vars.coinsInfo = {
      'btc': {
        connection: true,
        RT: true,
        relayFee: 0.00001
      },
      'btcd': {
        connection: true,
        RT: true,
        relayFee: 0.00001
      }
    };

    $storage['iguana-active-coin'] = { id: 'btc' };
    $storage['iguana-btc-passphrase'] = { 'logged': 'yes' };
    $auth.toState = { name: 'dashboard' };
    $auth.toParams = '';
    $auth.fromState = { name: 'login' };
    $auth.fromParams = '';

    // load and render template
    dashboardTemplate = $templateCache.get('partials/dashboard-main.html');
    angular.element(document.body).prepend('<div id="templatePreCompile">' + dashboardTemplate + '</div>');
    compiledTemplate = $compile(document.getElementsByTagName('script')[0].innerHTML)($rootScope);

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
          confirmCallback(vars.coinsInfo);
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
    spyOn(window, 'confirm').and.callFake(function () {
         return true;
    });

    $storage.isIguana = false;

    $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
      return [200, { result: fixture.load('btc_listtransactions_2.json') }];
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
  it('should verify dashboard template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
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
            placeholder2match.push({
              rendered: renderedPlaceholder[0],
              plain: placeholder[0].replace(/'/g, '')
            });
            var langObjSplit = placeholder2match[index].plain.split('.');
            expect(lang.EN[langObjSplit[0]][langObjSplit[1]]).toBeDefined();
            expect(placeholder2match[index].rendered.innerHTML.trim()).toEqual(lang.EN[langObjSplit[0]][langObjSplit[1]].trim());
            index++;
          }
        }
      }
    }

    $httpBackend.flush();
  });

  it('should test openAddCoinModal()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin',
        pass: '1234'
      }
    };
    expect($storage['dashboard-pending-coins']).not.toBeDefined();
    expect($scope.receivedObject).not.toBeDefined();
    $state.go = function(stateName) {
      expect(stateName).toEqual('signup.step1');
    }
    $scope.openAddCoinModal();
    expect($scope.receivedObject).toEqual(['btc']);
    expect($storage['dashboard-pending-coins']).toEqual(true);
    expect($scope.coins).toEqual(vars.coinsInfo);
  });

  it('should test openAddCoinLoginModal()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $scope.openAddCoinLoginModal();
  });

  it('should test setActiveCoin()', function() {
    $storage.isIguana = false;

    $httpBackend.whenPOST('http://localhost:1337/localhost:14632').respond(function(method, url, data) {
      expect(JSON.parse(data).method).toEqual('listtransactions');
      return [200, { result: fixture.load('btc_listtransactions_2.json') }];
    });

    $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
      expect(JSON.parse(data).method).toEqual('getbalance');
      return [200, 10];
    });

    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    var item = {
      coinId: 'btcd',
      id: 'btcd',
      name: 'BitcoinDark',
      pass: '1234',
      coinValue: 1,
      currencyValue: 10
    };
    expect($storage['iguana-active-coin'].id).toEqual('btc');
    expect($scope.txUnit.activeCoinBalance).toEqual(0);
    expect($scope.txUnit.activeCoinBalanceCurrency).toEqual(0);
    expect($scope.txUnit.transactions).toEqual([]);
    $state.go = function(stateName) {
      expect(stateName).toEqual('login');
    };
    $scope.sideBarCoinsUnsorted = {
      'btcd': {
        coinValue: 1,
        currencyValue: 10
      }
    };
    $httpBackend.flush();
    $scope.setActiveCoin(item);
    $httpBackend.flush();
    expect($storage['iguana-active-coin'].id).toEqual('btcd');
    expect($scope.txUnit.activeCoinBalance).toEqual(1);
    expect($scope.txUnit.activeCoinBalanceCurrency).toEqual(10);
    expect($scope.txUnit.transactions.length).toEqual(fixture.load('btc_listtransactions_2.json').length);
    // mobile state change
    $window.innerWidth = 320;
    $state.current.name = 'dashboard.mobileCoins';
    $state.go = function(stateName) {
      expect(stateName).toEqual('dashboard.mobileTransactions');
    };
    $scope.setActiveCoin(item);
  });

  it('should get active coin', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    expect($state.current.name).toEqual('login');
    delete $storage['iguana-login-active-coin'];
    expect($scope.getActiveCoins()).not.toBeDefined();
    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };
    var activeCoins = $scope.getActiveCoins();
    expect(activeCoins).toEqual($storage['iguana-login-active-coin']);
  });

  it('should remove coin', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $scope.sideBarCoinsUnsorted = {
      'btc': {
        coinId: 'btc'
      },
      'btcd': {
        coinId: 'btcd'
      }
    };
    $scope.sideBarCoins = [{
      coinId: 'btc',
      id: 'btc',
      name: 'Bitcoin',
      pass: '1234',
      coinValue: 1,
      currencyValue: 10
    }, {
      coinId: 'btcd',
      id: 'btcd',
      name: 'BitcoinDark',
      pass: '1234',
      coinValue: 1,
      currencyValue: 10
    }];
    $scope.removeCoin('btc');
    expect($scope.sideBarCoinsUnsorted).toEqual({
      'btcd': {
        'coinId': 'btcd'
      }
    });
    expect($scope.sideBarCoins).toEqual([{ coinId: 'btcd' }]);
  });

  it('should test constructAccountCoinRepeater()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $httpBackend.flush();
    $scope.sideBarCoins = [];
    $scope.karma.constructAccountCoinRepeater(true, true);
    expect($scope.sideBarCoins).toEqual([{
      id: 'btc',
      coinIdUc: 'BTC',
      name: 'Bitcoin',
      loading: true
    }]);
    // #2
    $scope.karma.constructAccountCoinRepeater(true, false);
    $httpBackend.flush();
    expect($scope.sideBarCoins[0].coinBalanceUnformatted.result.length).toEqual(2);
    expect($scope.sideBarCoins[0].loading).toEqual(false);
  });

  it('should test constructAccountCoinRepeaterCB()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $httpBackend.flush();
    $scope.sideBarCoins = [];
    $scope.karma.constructAccountCoinRepeaterCB(10, 'btc');
    expect($scope.sideBarCoins).toEqual([{
      id: 'btc',
      name: 'Bitcoin',
      coinBalanceUnformatted: 10,
      coinValue: 10,
      coinIdUc: 'BTC',
      currencyValue: 7875.2,
      currencyName: 'USD',
      loading: false
    }]);
  });

  it('should test checkAddCoinButton()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $httpBackend.flush();
    expect($scope.addCoinButtonState).toEqual(true);
    $storage['iguana-btcd-passphrase'] = { 'logged': 'yes' };
    $scope.karma.checkAddCoinButton();
    expect($scope.addCoinButtonState).toEqual(false);
  });

  it('should test updateTotalBalance()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $rates.updateRates = function(key, defaultCurrency, state) {
      return 700;
    };
    $httpBackend.flush();
    expect($scope.totalBalance).toEqual(0);
    $scope.sideBarCoinsUnsorted = {
      'btc': {
        coinId: 'btc',
        coinBalanceUnformatted: 10
      },
      'btcd': {
        coinId: 'btcd',
        coinBalanceUnformatted: 20
      }
    };
    $scope.karma.updateTotalBalance();
    expect($scope.totalBalance).toEqual(21000);
  });

  it('should test constructTransactionUnitRepeater()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $httpBackend.flush();
    expect($scope.txUnit.loading).toEqual(false);
    $scope.karma.constructTransactionUnitRepeater();
    expect($scope.txUnit.loading).toEqual(true);
    $scope.karma.constructTransactionUnitRepeater(true);
    expect($scope.txUnit.loading).toEqual(true);
    expect($scope.txUnit.transactions).toEqual([]);
  });

  it('should test constructTransactionUnitRepeaterCB()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $httpBackend.flush();
    $scope.txUnit.transactions = [];
    $scope.txUnit.loading = true;
    $scope.karma.constructTransactionUnitRepeaterCB();
    expect($scope.txUnit.transactions).toEqual([]);
    // #2
    var listTransactionsMock = fixture.load('btc_listtransactions_2.json'),
        switchStyleMock = [false, true];
    $scope.karma.constructTransactionUnitRepeaterCB(listTransactionsMock);
    expect($scope.txUnit.loading).toEqual(false);

    for (var i=0; i < listTransactionsMock.length; i++) {
      expect($scope.txUnit.transactions[i].hash).toEqual(listTransactionsMock[i].address);
      expect($scope.txUnit.transactions[i].switchStyle).toEqual(switchStyleMock[i]);
      expect($scope.txUnit.transactions[i].amount).toEqual(Math.abs(listTransactionsMock[i].amount));
      expect($scope.txUnit.transactions[i].confs).toEqual(Math.abs(listTransactionsMock[i].confirmations));
      expect($scope.txUnit.transactions[i].timestampUnchanged).toEqual(listTransactionsMock[i].blocktime);
    }
  });

  it('should test updateFeeParams()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    $httpBackend.flush();
    $storage.feeSettings = fixture.load('btc_fee_settings.json').feeSettings;
    $scope.karma.updateFeeParams();
    expect($storage.feeSettings).toEqual({ activeCoin: 'btc' });
    $httpBackend.flush();
    var dashboardFeeSettingsMock = fixture.load('dashboard_fee_settings.json');
    expect($storage.feeSettings.items[0]).toEqual(dashboardFeeSettingsMock[0]);
    expect($storage.feeSettings.items[1]).toEqual(dashboardFeeSettingsMock[1]);
    expect($storage.feeSettings.items[2]).toEqual(dashboardFeeSettingsMock[2]);
    expect($storage.feeSettings.items[3]).toEqual(dashboardFeeSettingsMock[3])
  });

  it('should test switchLayoutMode()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('dashboardController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $rootScope.$digest();
    // mobile
    $window.innerWidth = 320;
    $state.current.name = 'dashboard.main';
    $state.go = function(stateName) {
      expect(stateName).toEqual('dashboard.mobileCoins');
    };
    $scope.karma.switchLayoutMode();
    // desktop
    $window.innerWidth = 1920;
    $state.current.name = 'dashboard.mobileCoins';
    $state.go = function(stateName) {
      expect(stateName).toEqual('dashboard.main');
    };
    $scope.karma.switchLayoutMode();
  });
});