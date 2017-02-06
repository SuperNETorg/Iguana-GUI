describe('receiveCoinModal controller test', function() {
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

    $storage['iguana-active-coin'] = { id: 'btc' };
    $storage['iguana-btc-passphrase'] = { 'logged': 'yes' };
    $storage['dashboard-logged-in-coins'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };

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
      },
    };

    // load and render template
    dashboardTemplate = $templateCache.get('partials/receive-coin.html');
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
          console.log('modal opened');
          confirmCallback(null, 'coins');
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
    spyOn($uibModalInstance, 'open').and.returnValue(fakeModal);

    $storage.isIguana = false;

    $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
      expect(JSON.parse(data).params).toEqual(['']);
      expect(JSON.parse(data).method).toEqual('getaccountaddress');
      return [200, { result: 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d' }];
    });

    // mock rates service
    $storage['iguana-rates-btc'] = {
      shortName: 'USD',
      value: 700,
      updatedAt: new Date().setHours(new Date().getHours() - 1)
    };
    $rates.updateRates = function() {
      return $storage['iguana-rates-btc'].value;
    }
  }));

  // this should verify that placeholders are set in lang file and rendered correctly
  it('should receive coin modal template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('receiveCoinModalController', {
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

  it('should test close()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('receiveCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $scope.close();
  });

  it('should test coinAmountKeying()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('receiveCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.receiveCoin = {
      coinAmount: 1
    };
    $scope.coinAmountKeying();
    expect($scope.receiveCoin.currencyAmount).toEqual('700');
    $scope.receiveCoin = {
      coinAmount: 0.0001
    };
    $scope.coinAmountKeying();
    expect($scope.receiveCoin.currencyAmount).toEqual('0.07');
    $scope.receiveCoin = {
      coinAmount: 0.000001
    };
    $scope.coinAmountKeying();
    expect($scope.receiveCoin.currencyAmount).toEqual('0.0007');
  });

  it('should test currencyAmountKeying()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('receiveCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    $scope.receiveCoin = {
      currencyAmount: 700
    };
    $scope.currencyAmountKeying();
    expect($scope.receiveCoin.coinAmount).toEqual('1');
    $scope.receiveCoin = {
      currencyAmount: 0.07
    };
    $scope.currencyAmountKeying();
    expect($scope.receiveCoin.coinAmount).toEqual('0.0001');
    $scope.receiveCoin = {
      currencyAmount: 0.0007
    };
    $scope.currencyAmountKeying();
    expect($scope.receiveCoin.coinAmount).toEqual('0.000001');
  });

  var getReceiveCoinAddressTest = 0;
  // async strategy is required
  describe('async getReceiveCoinAddress', function () {
    beforeEach(function (done) {
      var $scope = $rootScope.$new(),
          controller = $controller('receiveCoinModalController', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance,
            receivedObject: receivedObject,
            type: type
          });

      $scope.karma.getReceiveCoinAddress();

      getReceiveCoinAddressTest = $scope.receiveCoin;

      $httpBackend.flush();

      testAsync(done);
    });

    it('shoud check $scope vars after getReceiveCoinAddress()', function() {
      $storage.isIguana = false;
      var qrFixture = fixture.load('btc_qr.json');
      expect(getReceiveCoinAddressTest.qrCode).toEqual(qrFixture.qr);
      expect(getReceiveCoinAddressTest.address).toEqual('mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d');
      expect(getReceiveCoinAddressTest.addressFormatted).toEqual('mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d'.match(/.{1,4}/g).join(' '));
      expect(getReceiveCoinAddressTest.shareUrl).toEqual('mailto:?subject=Here%20is%20my%20Bitcoin%20address&body=Hello,%20here%20is%20my%20Bitcoin%20address%20' + 'mn7QivjhhDqdfDbchHFXdTiHj9ownGd15d')
    });
  });
});