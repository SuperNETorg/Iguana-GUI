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

      if (format === 'DDMMMYYYY') {
        return date + ' ' + month + ' ' + year;
      }

      if (format === 'HHMM') {
        return hour + ':' + min;
      }
    };

    // in seconds
    this.getTimeDiffBetweenNowAndDate = function(from) {
      var currentEpochTime = new Date(Date.now()) / 1000,
          secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

      return secondsElapsed;
    };

    // minutes to seconds
    this.minuteMilliSec = function(minute) {
      return 60 * 1000 * parseFloat(minute);
    }
  }
]);