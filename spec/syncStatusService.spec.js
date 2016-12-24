describe('syncStatus service test', function() {
  describe('syncStatus', function() {
    var $window, $filer, $message, vars;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$state_, _$filter_, _$storage_, _vars_) {
      $state = _$state_;
      $filter = _$filter_;
      $storage = _$storage_;
      vars = _vars_;

      vars.coinsInfo = {
        'btc': {
          connection: true,
          RT: true,
          relayFee: 0.00001
        }
      };
    }));

    it('shoud exist', inject(function($syncStatus) {
      expect($syncStatus).toBeDefined();
    }));

    it('shoud set portpoll localstorage obj', inject(function($syncStatus) {
      $storage.isIguana = false;
      $storage.isProxy = true;

      $syncStatus.setPortPollResponse();
      expect($storage['iguana-port-poll']).toBeDefined();
      expect($storage['iguana-port-poll'].info).toBeDefined();
      expect($storage['iguana-port-poll'].info[0].coin).toEqual('btc');
      expect($storage['iguana-port-poll'].info[0].RT).toEqual(true);
      expect($storage['iguana-port-poll'].info[0].relayFee).toEqual(0.00001);
      expect($storage['iguana-port-poll'].proxy).toEqual(true);
      expect($storage['iguana-port-poll'].isIguana).toEqual(false);
    }));

    it('shoud get portpoll data from localstorage', inject(function($syncStatus) {
      $storage.isIguana = true;
      $storage.isProxy = false;
      vars.coinsInfo = {};

      $syncStatus.getPortPollResponse($storage['iguana-port-poll']);
      expect($storage.isIguana).toEqual(false);
      expect($storage.isProxy).toEqual(true);
      expect(vars.coinsInfo).toEqual({ 'btc': { connection: true, RT: true, relayFee: 0.00001 } });
    }));
  });
});