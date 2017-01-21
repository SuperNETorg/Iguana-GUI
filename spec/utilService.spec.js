describe('util service test', function() {
  describe('util', function() {
    var $window, $filer, $message;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$window_, _$filter_, _$message_) {
      $window = _$window_;
      $filter = _$filter_;
      $message = _$message_;
    }));

    it('shoud exist', inject(function(util) {
      expect(util).toBeDefined();
    }));

    it('shoud add modal-open class to body', inject(function(util) {
      util.bodyBlurOn();
      expect(angular.element(document.body)[0].className).toEqual('modal-open');
    }));

    it('shoud add modal-open class to body', inject(function(util) {
      util.bodyBlurOff();
      expect(angular.element(document.body)[0].className).toEqual('');
    }));

    it('shoud reindex assoc array', inject(function(util) {
      var testArray = [
            {
              shortName: 'sys',
              fullName: 'Syscoin'
            }, {
              shortName: 'mzc',
              fullName: 'Mazacoin'
            }
          ],
          testArrayAssoc = {
            0: {
              shortName: 'sys',
              fullName: 'Syscoin'
            },
            1: {
              shortName: 'mzc',
              fullName: 'Mazacoin'
            }
          },
          reindexAssocArray = util.reindexAssocArray(testArrayAssoc);

      expect(reindexAssocArray).toEqual(testArray);
    }));

    it('shoud get coin keys', inject(function(util) {
      var test =
            [
              { coinId: 'btc' },
              { coinId: 'ltc' },
              { coinId: 'kmd' },
              { randomkey: 'random' }
            ],
          extractedCoinKeys = util.getCoinKeys(test);

      expect(extractedCoinKeys).toEqual(['btc', 'ltc', 'kmd']);
    }));

    it('shoud trim a string', inject(function(util) {
      var testString1 = 'btc, ltc, ',
          testString2 = 'btc, ltc,',
          trimmedString1 = util.trimComma(testString1),
          trimmedString2 = util.trimComma(testString2);

      expect(trimmedString1).toEqual('btc, ltc');
      expect(trimmedString2).toEqual('btc, ltc');
    }));

    it('shoud flag isMobile', inject(function(util) {
      expect(util.isMobile()).toEqual(false);
      $window.innerWidth = 700;
      expect(util.isMobile()).toEqual(true);
    }));

    it('shoud get element offset vanilla js', inject(function(util) {
      var bodyElement = document.querySelectorAll('body')[0];
          bodyOffset = util.getElementOffset(bodyElement);

      expect(bodyOffset.top).toEqual(8);
      expect(bodyOffset.left).toEqual(8);
    }));

    it('shoud copy to clipboard', inject(function(util) {
      var inputElement = angular.element('<input value="test test">');

      $message.ngPrepMessageModal = function(text, color) {
        expect(text).toEqual('test copied to clipboard </br>"" ');
        expect(color).toEqual('blue');
      };

      expect(util.isExecCopyFailed).toEqual(false);
      util.execCommandCopy(inputElement, 'test');
      expect(util.isExecCopyFailed).toEqual(false);
    }));

    it('shoud fail copy to clipboard', inject(function(util) {
      var inputElement = angular.element('<input value="test test">');
      util.isExecCopyFailed = true;
      util.execCommandCopy(inputElement, 'test');
      expect(util.isExecCopyFailed).toEqual(true);
    }));

    it('shoud test checkFeeCount', inject(function(util) {
      var checkFeeCount = util.checkFeeCount(1000, 700);
      expect(checkFeeCount.coin).toEqual(0.01024);
      expect(checkFeeCount.amount).toEqual(7.168);
    }));
  });
});