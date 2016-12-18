describe('message service test', function() {
  describe('message', function() {
    beforeEach(module('IguanaGUIApp'));

    it('shoud exist', inject(function($message) {
      expect($message).toBeDefined();
      expect($message.ngPrepMessageModal(null, 'red', 'noDaemon')).toEqual(jasmine.any(Object));
    }));

    it('shoud return uibootstrap object', inject(function($message) {
      expect($message).toBeDefined();
      expect($message.ngPrepMessageModal(null, 'red', 'noDaemon')).toEqual(jasmine.any(Object));
      expect($message.ngPrepMessageModal(null, 'red', 'noDaemon').opened).toEqual(jasmine.any(Object));
      expect($message.ngPrepMessageModal(null, 'red', 'noDaemon').closed).toEqual(jasmine.any(Object));
      expect($message.ngPrepMessageModal(null, 'red', 'noDaemon').rendered).toEqual(jasmine.any(Object));
    }));
  });
});