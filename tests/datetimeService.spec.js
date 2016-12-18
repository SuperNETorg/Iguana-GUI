describe('datetime service test', function() {
  describe('datetime', function() {
    beforeEach(module('IguanaGUIApp'));

    it('shoud exist', inject(function($datetime) {
      expect($datetime).toBeDefined();
    }));

    it('shoud return 17:10', inject(function($datetime) {
      var currentDate = new Date(Date.UTC(2016, 1, 1, 14, 10, 0));
      expect($datetime.convertUnixTime(currentDate / 1000, 'HHMM')).toEqual('17:10')
    }));

    it('shoud return 1 Feb 2016', inject(function($datetime) {
      var currentDate = new Date(Date.UTC(2016, 1, 1, 14, 10, 0));
      expect($datetime.convertUnixTime(currentDate / 1000, 'DDMMMYYYY')).toEqual('1 Feb 2016')
    }));

    it('shoud return difference 3600s (1h)', inject(function($datetime) {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 1)
      expect(Math.abs(Math.floor($datetime.getTimeDiffBetweenNowAndDate(currentDate)))).toEqual(3600);
    }));
  });
});