describe('settings controller test', function() {
  beforeEach(module('IguanaGUIApp'));
  beforeEach(module('templates'));

  var $controller, $state, $auth, util, $window, $templateCache, $message, $api, $q, $rates,
      $compile, $rootScope, $storage, $httpBackend, vars, dashboardTemplate, compiledTemplate, pristineTemplate = {};

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
      }
    };

    $auth.toState = { name: 'dashboard' };
    $auth.toParams = '';
    $auth.fromState = { name: 'login' };
    $auth.fromParams = '';
    $storage['iguana-active-coin'] = { id: 'btc' };
    $storage['iguana-btc-passphrase'] = { 'logged': 'yes' };

    // load and render template
    dashboardTemplate = $templateCache.get('partials/reference-currency.html');
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

    var fakeModal = {
      result: {
        then: function(confirmCallback, cancelCallback) {
          this.confirmCallBack = confirmCallback;
          this.cancelCallback = cancelCallback;
        }
      },
      close: function(item) {
        this.result.confirmCallBack(item);
      },
      dismiss: function(type) {
        this.result.cancelCallback(type);
      }
    };

    spyOn($uibModal, 'open').and.returnValue(fakeModal);

    $storage.isIguana = false;
    $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
      expect(JSON.parse(data).method).toEqual('getbalance');
      return [200, 10];
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
  it('should verify reference currency template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('settingsController', { $scope: $scope });
    $rootScope.$digest();
    for (var i=0; i < 1; i++) {
      if (pristineTemplate['template' + i]) {
        var langPlaceholders = pristineTemplate['template' + i].match(/{{ (.*) }}/g),
            placeholder2match = [],
            index = 0;
        for (var j=0; j < langPlaceholders.length; j++) {
          var renderedPlaceholder = $compile('<div>' + langPlaceholders[j] + '</div>')($rootScope);
          $rootScope.$digest();
          if (langPlaceholders[j].indexOf(' | lang') > -1) {
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
  });

  it('should set currencyArr object coin', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('settingsController', { $scope: $scope });
    $rootScope.$digest();

    var initCurrencyArray = $scope.karma.initCurrencyArray();
    expect($scope.karma.currencyArr.length).toEqual(initCurrencyArray.length);

    for (var i=0; i < initCurrencyArray.length; i++) {
      expect(initCurrencyArray[i].shortName).toBeDefined();
      expect(initCurrencyArray[i].shortName).toEqual($scope.karma.currencyArr[i]);
      var langObjSplit = initCurrencyArray[i].fullName.split('.');
      expect(lang.EN[langObjSplit[0]][langObjSplit[1]]).toBeDefined();
      expect(initCurrencyArray[i].flagId).toEqual(($scope.karma.currencyArr[i][0] + $scope.karma.currencyArr[i][1]).toLowerCase());
    }
  });

  it('should select new default currency', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('settingsController', { $scope: $scope });
    $rootScope.$digest();
    $storage['iguana-currency'] = { 'name': 'USD' };
    $storage['iguana-rates-btc'] = {};
    var initCurrencyArray = $scope.karma.initCurrencyArray();
    $scope.setCurrency(initCurrencyArray[1]);
    expect($rates.getCurrency()).toEqual({ 'name': 'EUR' });
    expect($storage['iguana-rates-btc']).toBeDefined();
    expect($storage['iguana-rates-btc'].forceUpdate).toEqual(true);
  });

  it('should test global fee change', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('settingsController', { $scope: $scope });
    $rootScope.$digest();

    expect($scope.checkedAmountType).toEqual('Minimum');
    $scope.items = {
      id: 0,
      name: lang.EN['SEND']['FEE_MIN'],
      coin: 0.00001,
      amount: (700 * 0.00001),
      feeMinTime: 10,
      feeMaxTime: 20
    };
    $scope.currency = 'USD';
    $scope.coinId = 'BTC';
    $scope.checkModel = { type: JSON.stringify($scope.items) };
    $scope.change();
    expect($scope.fee).toEqual($scope.items.coin);
    expect($scope.feeCurrency).toEqual($scope.items.amount);
    expect($scope.feeAllText).toEqual($scope.items.coin + ' ' + $scope.coinId);
    expect($scope.feeCurrencyAllText).toEqual($scope.items.amount + ' ' + $scope.currency);
  });

  it('should test onInit()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('settingsController', { $scope: $scope });
    $rootScope.$digest();
    $storage['iguana-currency'] = { 'name': 'USD' };

    $httpBackend.flush();

    $scope.karma.onInit();

    expect($scope.items).toBeDefined();
    expect($scope.items.length).toEqual(4);
  });
});