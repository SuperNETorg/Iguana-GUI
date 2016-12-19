describe('passPhraseGenerator service test', function() {
  describe('passPhraseGenerator', function() {
    beforeEach(function() {
      jasmine.addMatchers({ // custom passphrase length matcher
        toHaveNWords: function(bits) {
          return {
            compare: function(passphrase, bits) {
              var _passphrase = passphrase.split(' '),
                  result = {
                    pass: _passphrase.length === bits * 3
                  };

              if (_passphrase.length !== bits * 3) {
                result.message =  'Expected passphrase to consist of ' + (bits * 3) + ' words';
              }

              return result;
            }
          }
        }
      });
    });

    beforeEach(module('IguanaGUIApp'));

    it('shoud exist', inject(function($passPhraseGenerator) {
      expect($passPhraseGenerator).toBeDefined();
      expect($passPhraseGenerator.generatePassPhrase(1)).toHaveNWords(1);
    }));

    it('should contain 12 words', inject(function($passPhraseGenerator) {
      expect($passPhraseGenerator.generatePassPhrase(4)).toHaveNWords(4);
    }));

    it('should contain 24 words', inject(function($passPhraseGenerator) {
      expect($passPhraseGenerator.generatePassPhrase(8)).toHaveNWords(8);
    }));
  });
});