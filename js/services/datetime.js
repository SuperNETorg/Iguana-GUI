'use strict';

angular.module('IguanaGUIApp')
.service('$datetime', [
  '$filter',
  '$timeout',
  function($filter, $timeout) {
    this.convertUnixTime = function(UNIX_timestamp, format) {
      var a = new Date(UNIX_timestamp * 1000),
          months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          year = a.getFullYear(),
          month = months[a.getMonth()],
          date = a.getDate(),
          hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours(),
          min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes(),
          sec = a.getSeconds();

      if (format === 'DDMMMYYYY') return date + ' ' + month + ' ' + year + ' ';
      if (format === 'HHMM') return hour + ':' + min;
    };

    this.timeAgo = function(element) { // TODO: move datetime service
      $timeout(function() {
        if ($(element).length) { // TODO: refactor, no jquery
          var timeAgo = $(element),
              threshold = settings.thresholdTimeAgo,
              displayText = '';

          if (!timeAgo.prop('data-original')) {
            timeAgo.prop('data-original', timeAgo[0].cloneNode(true));
          }

          var timeAgoOriginal = timeAgo.prop('data-original'),
              date = timeAgo.find('.time-ago-date', timeAgoOriginal).text(),
              time = timeAgo.find('.time-ago-time', timeAgoOriginal).text(),
              dateTime = date + ' ' + time,
              original = new Date(dateTime),
              current = new Date(),
              dayTemplate = 24 * 60 * 60 * 1000,
              timeTemplate = 60 * 60 * 1000,
              minuteTemplate = 60 * 1000,
              difference = current - original;

          if ((threshold.hasOwnProperty('day') && (difference / dayTemplate) > threshold.day) ||
              (threshold.hasOwnProperty('time') && (difference / timeTemplate) > threshold.time) ||
              (threshold.hasOwnProperty('minute') && (difference / minuteTemplate) > threshold.minute)) {
            return;
          }

          if (difference / dayTemplate < 1) {
            if (difference / timeTemplate < 1) {
              if (difference / minuteTemplate > 1) {
                var minutes = parseInt(difference / minuteTemplate);

                displayText = minutes + ' ' + $filter('lang')(minutes > 1 ? 'TIME_AGO.MINUTES' : 'TIME_AGO.MINUTE');
              }
            } else {
              var hours = parseInt(difference / timeTemplate);

              displayText = hours + ' ' + $filter('lang')(hours > 1 ? 'TIME_AGO.HOURS' : 'TIME_AGO.HOUR');
            }
          } else {
            var days = parseInt(difference / dayTemplate);

            displayText = days + ' ' + $filter('lang')(days > 1 ? 'TIME_AGO.DAYS' : 'TIME_AGO.DAY');
          }
          timeAgo.text(displayText);
        }
      }.bind(this), 100)
    };

    // in seconds
    this.getTimeDiffBetweenNowAndDate = function(from) {
      var currentEpochTime = new Date(Date.now()) / 1000,
          secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

      return secondsElapsed;
    };
  }
]);