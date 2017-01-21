describe('selectCoinModal controller test', function() {
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
    dashboardTemplate = $templateCache.get('partials/add-coin.html');
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
  }));

  // this should verify that placeholders are set in lang file and rendered correctly
  it('should verify select coin modal template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
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
  });

  it('should test constructCoinRepeater()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    var testVal = [{
      coinId: 'btcd',
      id: 'BTCD',
      name: 'BitcoinDark',
      color: 'orange'
    }];
    var activeCoins = $scope.karma.constructCoinRepeater();
    expect(activeCoins).toEqual(testVal);
  });

  it('should get selected coins', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    delete $storage['iguana-login-active-coin'];
    expect($scope.karma.getSelectedCoins()).toEqual({});
    $storage['iguana-login-active-coin'] = {
      'btcd': {
        coinId: 'btcd',
        id: 'BTCD',
        name: 'BitcoinDark',
        color: 'orange'
      }
    };
    var activeCoins = $scope.karma.getSelectedCoins();
    expect(activeCoins).toEqual($storage['iguana-login-active-coin']);
  });

  it('should get active coin', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $storage['iguana-login-active-coin'] = {
      'btcd': {
        coinId: 'btcd',
        id: 'BTCD',
        name: 'BitcoinDark'
      }
    };
    var activeCoin = $scope.isActive({ coinId: 'btcd' });
    expect(activeCoin).toEqual($storage['iguana-login-active-coin'].btcd);
  });

  it('should test isDisabled()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    var isDisabled = $scope.isDisabled();
    expect(isDisabled).toEqual(true);
    $storage['iguana-login-active-coin'] = {
      'btcd': {
        coinId: 'btcd',
        id: 'BTCD',
        name: 'BitcoinDark'
      }
    };
    isDisabled = $scope.isDisabled();
    expect(isDisabled).toEqual(false);
  });

  it('should test close()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    $scope.close();
  });

  it('should test getPassphrase()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });

    var getPassphrase = $scope.karma.getPassphrase('btc');
    console.log(getPassphrase);
  });

  it('should test clickOnCoin()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('selectCoinModalController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject,
          type: type
        });
    var testCoin = {
      coinId: 'btcd',
      id: 'BTCD',
      name: 'BitcoinDark'
    };
    expect($storage['iguana-login-active-coin']).toEqual({});
    $scope.clickOnCoin(testCoin, '123');
    expect($storage['iguana-login-active-coin'].btcd).toBeDefined();
    expect($storage['iguana-login-active-coin'].btcd.coinId).toEqual('btcd');
    expect($storage['iguana-login-active-coin'].btcd.id).toEqual('BTCD');
    expect($storage['iguana-login-active-coin'].btcd.name).toEqual('BitcoinDark');
  });
});