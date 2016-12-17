describe('passPhraseGenerator service test', function() {
  describe('passPhraseGenerator', function() {
    beforeEach(module('IguanaGUIApp'));

    it('shoud exist', inject(function($passPhraseGenerator) {
      expect($passPhraseGenerator).toBeDefined();
      console.log($passPhraseGenerator.generatePassPhrase(2));
    }))
  })
});