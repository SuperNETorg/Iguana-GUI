'use strict';

angular.module('IguanaGUIApp')
.directive('timeago', function($filter) {
  return function(scope, element) {
    var children = element[0].children,
        threshold = settings.thresholdTimeAgo,
        displayText = '',
        date = scope.$eval(children[0].getAttribute('timeago-date')),
        time = scope.$eval(children[1].getAttribute('timeago-time')),
        dateTime = date + ' ' + time,
        original = new Date(dateTime),
        current = new Date(),
        dayTemplate = 24 * 60 * 60 * 1000,
        timeTemplate = 60 * 60 * 1000,
        minuteTemplate = 60 * 1000,
        difference = current - original;

    if (
      (threshold.hasOwnProperty('day') && (difference / dayTemplate) > threshold.day) ||
      (threshold.hasOwnProperty('time') && (difference / timeTemplate) > threshold.time) ||
      (threshold.hasOwnProperty('minute') && (difference / minuteTemplate) > threshold.minute)
    ) {
      children[0].innerText = date;
      children[1].innerText = time;
      scope.timeAgoClass = 'two-lines';
    } else {
      if (difference / dayTemplate < 1) {
        if (difference / timeTemplate < 1) {
          if (difference / minuteTemplate > 1) {
            var minutes = parseInt(difference / minuteTemplate);

            displayText = minutes + ' ' + $filter('lang')(minutes > 1 ? 'TIME_AGO.MINUTES' : 'TIME_AGO.MINUTE');
          } else {
            displayText = $filter('lang')('TIME_AGO.MOMENT');
          }
        } else {
          var hours = parseInt(difference / timeTemplate);

          displayText = hours + ' ' + $filter('lang')(hours > 1 ? 'TIME_AGO.HOURS' : 'TIME_AGO.HOUR');
        }
      } else {
        var days = parseInt(difference / dayTemplate);

        displayText = days + ' ' + $filter('lang')(days > 1 ? 'TIME_AGO.DAYS' : 'TIME_AGO.DAY');
      }

      scope.timeAgoClass = '';
      element.text(displayText);
    }
  }
});