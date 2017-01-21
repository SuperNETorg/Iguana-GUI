describe('timeAgo directive test', function() {
  describe('timeAgo directive', function() {
    var $compile, $rootScope, $datetime;

    beforeEach(module('IguanaGUIApp'));
    beforeEach(module('templates'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$datetime_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $datetime = _$datetime_;
    }));

    it('shoud render regular two-line date', function() {
      $rootScope.item = {
        timestampDate: $datetime.convertUnixTime(1475167617, 'DDMMMYYYY'),
        timestampTime: $datetime.convertUnixTime(1475167617, 'HHMM')
      };
      var renderHtml = $compile('<div class="timestamp unselectable time-ago" timeago ng-class="timeAgoClass">' +
                                  '<div timeago-date="item.timestampDate" class="timestamp-date time-ago-date"></div>' +
                                  '<div timeago-time="item.timestampTime" class="timestamp-time time-ago-time"></div>' +
                                '</div>')($rootScope);
      $rootScope.$digest();
      var timeAgoDateHTML = angular.element(renderHtml[0].getElementsByClassName('time-ago-date')).text(),
          timeAgoTimeHTML = angular.element(renderHtml[0].getElementsByClassName('time-ago-time')).text();
      expect(timeAgoDateHTML).toEqual('29 Sep 2016');
      expect(timeAgoTimeHTML).toEqual('19:46');
    });

    it('shoud render 1 hour ago', function() {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 1);
      $rootScope.item = {
        timestampDate: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'DDMMMYYYY'),
        timestampTime: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'HHMM')
      };
      var renderHtml = $compile('<div class="timestamp unselectable time-ago" timeago ng-class="timeAgoClass">' +
                                  '<div timeago-date="item.timestampDate" class="timestamp-date time-ago-date"></div>' +
                                  '<div timeago-time="item.timestampTime" class="timestamp-time time-ago-time"></div>' +
                                '</div>')($rootScope);
      $rootScope.$digest();
      var timeAgoHTML = angular.element(renderHtml).text();
      expect(timeAgoHTML).toEqual('1 hour ago');
    });

    it('shoud render 1 min ago', function() {
      var currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() - 1);
      $rootScope.item = {
        timestampDate: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'DDMMMYYYY'),
        timestampTime: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'HHMM')
      };
      var renderHtml = $compile('<div class="timestamp unselectable time-ago" timeago ng-class="timeAgoClass">' +
                                  '<div timeago-date="item.timestampDate" class="timestamp-date time-ago-date"></div>' +
                                  '<div timeago-time="item.timestampTime" class="timestamp-time time-ago-time"></div>' +
                                '</div>')($rootScope);
      $rootScope.$digest();
      var timeAgoHTML = angular.element(renderHtml).text();
      expect(timeAgoHTML).toEqual('1 min ago');
    });

    it('shoud render Moment ago', function() {
      var currentDate = new Date();
      $rootScope.item = {
        timestampDate: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'DDMMMYYYY'),
        timestampTime: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'HHMM')
      };
      var renderHtml = $compile('<div class="timestamp unselectable time-ago" timeago ng-class="timeAgoClass">' +
                                  '<div timeago-date="item.timestampDate" class="timestamp-date time-ago-date"></div>' +
                                  '<div timeago-time="item.timestampTime" class="timestamp-time time-ago-time"></div>' +
                                '</div>')($rootScope);
      $rootScope.$digest();
      var timeAgoHTML = angular.element(renderHtml).text();
      expect(timeAgoHTML).toEqual('Moment ago');
    });

    it('shoud render 1 day ago', function() {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 24);
      $rootScope.item = {
        timestampDate: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'DDMMMYYYY'),
        timestampTime: $datetime.convertUnixTime(currentDate.getTime() / 1000, 'HHMM')
      };
      var renderHtml = $compile('<div class="timestamp unselectable time-ago" timeago ng-class="timeAgoClass">' +
                                  '<div timeago-date="item.timestampDate" class="timestamp-date time-ago-date"></div>' +
                                  '<div timeago-time="item.timestampTime" class="timestamp-time time-ago-time"></div>' +
                                '</div>')($rootScope);
      $rootScope.$digest();
      var timeAgoHTML = angular.element(renderHtml).text();
      expect(timeAgoHTML).toEqual('1 day ago');
    });
  });
});