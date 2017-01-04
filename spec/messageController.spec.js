describe('message controller test', function() {
  beforeEach(module('IguanaGUIApp'));
  beforeEach(module('templates'));

  var $controller, $state, $auth, util, $window, $templateCache, $message, $api, $q, $rates, $uibModalInstance, receivedObject,
      $compile, $rootScope, $storage, $httpBackend, vars, dashboardTemplate, compiledTemplate, pristineTemplate = {};

  var $uibModalInstance = {
    close: function(returnValue) {
      console.log('close(), returnValue: ' + returnValue);
    },
    dismiss: function() {
      console.log('dismiss()');
    }
  };

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

    // load and render template
    dashboardTemplate = $templateCache.get('partials/message-modal.html');
    angular.element(document.body).prepend('<div id="templatePreCompile" class="iguana-modal">' + dashboardTemplate + '</div>');
    compiledTemplate = document.getElementsByTagName('script')[0].innerHTML;

    pristineTemplate['template0'] = compiledTemplate;

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

    $auth.toState = { name: 'dashboard' };
    $auth.toParams = '';
    $auth.fromState = { name: 'login' };
    $auth.fromParams = '';
  }));

  // this should verify that placeholders are set in lang file and rendered correctly
  it('should verify message modal template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('messageController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject
        });
    $rootScope.$digest();
    for (var i=0; i < 1; i++) {
      if (pristineTemplate['template' + i]) {
        var langPlaceholders = pristineTemplate['template' + i].match(/{{ (.*) }}/g),
            placeholder2match = [],
            index = 0;
        if (langPlaceholders)
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

  it('should set messageContent from $rootScope', function() {
    $storage.isIguana = false;
    expect($scope).not.toBeDefined();
    $rootScope.message = '123';

    var $scope = $rootScope.$new(),
        controller = $controller('messageController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject
        });

    expect($scope.messageContent).toEqual('123');
  });

  it('should test requirementsInfo()', function() {
    $storage.isIguana = false;

    expect($scope).not.toBeDefined();
    $rootScope.message = '123';

    var $scope = $rootScope.$new(),
        controller = $controller('messageController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject
        });

    $scope.requirementsInfo();
    expect($scope.messageContent).toEqual('Minimum daemon configuration to comminicate via http requests and a proxy server.');
    var modalClassName = angular.element(document.querySelector('.iguana-modal')).hasClass('msg-blue');
    expect(modalClassName).toEqual(true);
  });

  it('should test requirementsInfo()', function() {
    $storage.isIguana = false;

    expect($scope).not.toBeDefined();
    $rootScope.message = '123';

    var $scope = $rootScope.$new(),
        controller = $controller('messageController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject
        });

    $scope.requirementsInfo();
    expect($scope.messageContent).toEqual('Minimum daemon configuration to comminicate via http requests and a proxy server.');
    var modalClassName = angular.element(document.querySelector('.iguana-modal')).hasClass('msg-blue');
    expect(modalClassName).toEqual(true);
  });

  it('should test switchMessageBoxColor()', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('messageController', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          receivedObject: receivedObject
        });

    $scope.karma.switchMessageBoxColor('random');
    var modalClassName = angular.element(document.querySelector('.iguana-modal')).hasClass('msg-random');
    expect(modalClassName).toEqual(true);
  });
});