describe('topMenu controller test', function() {
  beforeEach(module('IguanaGUIApp'));
  beforeEach(module('templates'));

  var $controller, $state, $auth, util, $window, $templateCache,
      $compile, $rootScope, $storage, $httpBackend, vars, dashboardTemplate, compiledTemplate, pristineTemplate = {};

  beforeEach(inject(function(_$controller_, _$state_, _$auth_, _util_, _$window_, _$uibModal_,
                             _$templateCache_, _$compile_, _$rootScope_, _$storage_, _$httpBackend_, _vars_) {

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

    vars.coinsInfo = {
      'btc': {
        connection: true,
        RT: true,
        relayFee: 0.00001
      }
    };
    $storage['iguana-login-active-coin'] = {
      'btc': {
        coinId: 'btc',
        id: 'BTC',
        name: 'Bitcoin'
      }
    };
    $auth.toState = { name: 'dashboard' };
    $auth.toParams = '';
    $auth.fromState = { name: 'login' };
    $auth.fromParams = '';

    // load and render template
    dashboardTemplate = $templateCache.get('partials/dashboard-top-menu.html');
    angular.element(document.body).prepend('<div id="templatePreCompile">' + dashboardTemplate + '</div>');
    compiledTemplate = $compile(document.getElementsByTagName('script')[0].innerHTML)($rootScope);
    document.querySelector('#templatePreCompile').innerHTML = compiledTemplate[0].innerHTML;

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
  }));

  // this should verify that placeholders are set in lang file and rendered correctly
  it('should verify login template placeholders rendered correctly', function() {
    $storage.isIguana = false;

    var $scope = $rootScope.$new(),
        controller = $controller('topMenuController', { $scope: $scope });
    $rootScope.$digest();
    for (var i=0; i < 1; i++) {
      if (pristineTemplate['template' + i])
        var langPlaceholders = pristineTemplate['template' + i].match(/{{ (.*) }}/g),
            placeholder2match = [];
        for (var j=0; j < langPlaceholders.length; j++) {
          var renderedPlaceholder = $compile('<div>' + langPlaceholders[j] + '</div>')($rootScope);
          $rootScope.$digest();
          if (langPlaceholders[j].indexOf(' | lang') > -1)
            var placeholder = langPlaceholders[j].match(/'(.*)'/g);
            placeholder2match.push({ rendered: renderedPlaceholder[0], plain: placeholder[0].replace(/'/g, '') });
            var langObjSplit = placeholder2match[j].plain.split('.');
            expect(lang.EN[langObjSplit[0]][langObjSplit[1]]).toBeDefined();
            expect(placeholder2match[j].rendered.innerHTML).toEqual(lang.EN[langObjSplit[0]][langObjSplit[1]]);
        }
    }
  });

  it('should return navbar style', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('topMenuController', { $scope: $scope });
    $rootScope.$digest();
    var getNavbarStyle = $scope.getNavbarStyle();
    expect(getNavbarStyle).toEqual($scope.navbarStyle);
  });

  it('should trigger click events on mobile', function() {
    var $scope = $rootScope.$new(),
        controller = $controller('topMenuController', { $scope: $scope });
    $rootScope.$digest();
    expect($scope.isMobile).toEqual(false);
    $scope.clickRight();
    $scope.clickLeft();
    expect($scope.navbarStyle).toEqual({ 'margin-left': 0 });
    $scope.isMobile = true;
    window.innerWidth = 320;
    $scope.navbarStyle = { 'margin-left': '10px' };
    $scope.clickRight();
    expect($scope.navbarStyle).toEqual({ 'margin-left': '-854px' });
    $scope.clickLeft();
    expect($scope.navbarStyle).toEqual({ 'margin-left': '-902px' });
  });
});