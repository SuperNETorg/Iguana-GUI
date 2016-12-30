describe('signup controller test', function() {
  beforeEach(module('IguanaGUIApp'));
  beforeEach(module('templates'));

  var $controller, $state, $auth, util, $window, $templateCache, $message, $api, $q,
      $compile, $rootScope, $storage, $httpBackend, vars, dashboardTemplate, compiledTemplate, pristineTemplate = {};

  beforeEach(inject(function(_$controller_, _$state_, _$auth_, _util_, _$window_, _$uibModal_, _$message_, _$api_,
                             _$templateCache_, _$compile_, _$rootScope_, _$storage_, _$httpBackend_, _vars_, _$q_) {

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

    vars.coinsInfo = {
      'btc': {
        connection: true,
        RT: true,
        relayFee: 0.00001
      }
    };

    // load and render template
    dashboardTemplate = $templateCache.get('partials/signup.html');
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
  }));

  // this should verify that placeholders are set in lang file and rendered correctly
  it('should verify signup template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
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

  it('should get active coin', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
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

  it('should test setTitle()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };
    $scope.activeCoins = $storage['iguana-login-active-coin'];
    $rootScope.$digest();
    var setTitle = $scope.karma.setTitle();
    expect(setTitle).toEqual('Create Bitcoin wallet ');
  });

  it('should test destroy()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $storage.passphrase = '1234';
    $storage['iguana-login-active-coin'] = { 123: '123' };
    $storage['iguana-active-coin'] = { 123: '123' };
    $scope.karma.destroy();
    expect($storage['iguana-login-active-coin']).toEqual({});
    expect($storage['iguana-active-coin']).toEqual({});
    expect($storage.passphrase).toEqual('');
  });

  it('should test verifyPass()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    expect($scope.buttonCreateAccount).toEqual(false);
    $scope.buttonCreateAccount = true;
    $scope.verifyPass();
    expect($scope.buttonCreateAccount).toEqual(false);
  });

  it('should test isCoinSelected()', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    delete $storage['iguana-login-active-coin'];
    var isCoinSelected = $scope.karma.isCoinSelected();
    expect(isCoinSelected).toEqual(false);
    $storage['iguana-login-active-coin'] = {};
    isCoinSelected = $scope.karma.isCoinSelected();
    expect(isCoinSelected).toEqual(false);
    $storage['iguana-login-active-coin'] = { 'btc': {}, 'sys': {} };
    isCoinSelected = $scope.karma.isCoinSelected();
    expect(isCoinSelected).toEqual(false);
  });

  it('should test onInit() and generate a passphrase (coind)', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $storage.isIguana = false;
    expect($scope.passphrase).toEqual('');
    expect($scope.passphrase).toEqual('');
    $state.current.name = 'signup.step1';
    $scope.karma.onInit();
    var passphraseComponents = $storage.passphrase.split(' ');
    expect($scope.passphrase).toEqual($scope.passphrase);
    expect(passphraseComponents.length).toEqual(12);
  });

  it('should test onInit() and generate a passphrase (iguana)', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $storage.isIguana = true;
    expect($scope.passphrase).toEqual('');
    expect($scope.passphrase).toEqual('');
    $state.current.name = 'signup.step1';
    $scope.karma.onInit();
    var passphraseComponents = $storage.passphrase.split(' ');
    expect($scope.passphrase).toEqual($scope.passphrase);
    expect(passphraseComponents.length).toEqual(24);
  });

  it('should test addAccount() w/ error', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $message.ngPrepMessageModal = function(text, color) {
      expect(text).toEqual('Passphrases are not matching. Please repeat previous step one more time.');
      expect(color).toEqual('red');
    };
    $scope.passphrase = '';
    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };
    $scope.addAccount();
  });

  it('should test addAccount() and fail (coind)', function() {
    $storage.isIguana = false;
    $httpBackend.whenPOST('http://localhost:1337/localhost:8332').respond(function(method, url, data) {
      return [500, {'result': null, 'error': { 'code':-15, 'message': 'Error: running with an encrypted wallet, but encryptwallet was called.'}, 'id': null }];
    });

    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $message.ngPrepMessageModal = function(text, color) {
      expect(text).toEqual('Wallet is already encrypted with another passphrase! Try another wallet or login with your passphrase.');
      expect(color).toEqual('red');
    };
    $scope.passphrase = '123';
    $storage['passphrase'] = $scope.passphrase;
    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };
    $scope.addAccount();

    $httpBackend.flush();
  });

  it('should test addAccount() (iguana)', function() {
    $storage.isIguana = true;
    $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/encryptwallet').respond(function(method, url, data) {
      return [200, { result: '' }];
    });
    $httpBackend.whenPOST('http://localhost:7778').respond(function(method, url, data) {
      return [200, { result: '' }];
    });
    $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/walletlock').respond(function(method, url, data) {
      return [200, { result: '' }];
    });
    $httpBackend.whenPOST('http://localhost:7778/api/bitcoinrpc/walletpassphrase').respond(function(method, url, data) {
      return [200, { result: '' }];
    });

    var $scope = $rootScope.$new(),
        controller = $controller('signupController', { $scope: $scope });
    $message.ngPrepMessageModal = function(text, color) {
      expect(text).toEqual('btc wallet is created. Login to access it.');
      expect(color).toEqual('green');
      // mock modal obj
      var deferred = $q.defer();
      deferred.resolve(true);
      var promise = deferred.promise;

      return {
        closed: promise
      };
    };

    $scope.passphrase = '123';
    $storage['passphrase'] = $scope.passphrase;
    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };
    $storage['dashboard-pending-coins'] = { 'btc': {} };
    $scope.addAccount();

    $httpBackend.flush();
  });
});