/*!
 * Iguana helpers/Timeago
 * 
 */
helperProto.prototype.timeAgo = function () {
  var timesAgo = $('.time-ago', document),
    threshold = settings.thresholdTimeAgo,
    timeAgo,
    displayText = '';
  for (var i = 0; timesAgo.length > i; i++) {
    timeAgo = $(timesAgo[i]);
    if (!timeAgo.prop('data-original')) {
      timeAgo.prop('data-original', timeAgo.clone());
    }
    var timeAgoOriginal = timeAgo.prop('data-original');
    var date = $('.time-ago-date', timeAgoOriginal).text(),
      time = $('.time-ago-time', timeAgoOriginal).text();
    var dateTime = date + ' ' + time;
    var original = new Date(dateTime),
      current = new Date(),
      dayTemplate = 24 * 60 * 60 * 1000,
      timeTemplate = 60 * 60 * 1000,
      minuteTemplate = 60 * 1000;
    var difference = current - original;
    if ((threshold.hasOwnProperty('day') && (difference / dayTemplate) > threshold.day) ||
      (threshold.hasOwnProperty('time') && (difference / timeTemplate) > threshold.time) ||
      (threshold.hasOwnProperty('minute') && (difference / minuteTemplate) > threshold.minute)
    ) {
      return;
    }
    if (difference / dayTemplate < 1) {
      if (difference / timeTemplate < 1) {
        if (difference / minuteTemplate > 1) {
          displayText = parseInt(difference / minuteTemplate) + ' ' + helper.lang('TIME_AGO.MINUTE');
        } else {
          displayText = helper.lang('TIME_AGO.MOMENT');
        }
      } else {
        displayText = parseInt(difference / timeTemplate) + ' ' + helper.lang('TIME_AGO.HOURS');
      }
    } else {
      var days = parseInt(difference / dayTemplate);
      if (days > 1) {
        displayText = parseInt(difference / dayTemplate) + ' ' + helper.lang('TIME_AGO.DAYS');
      } else {
        displayText = parseInt(difference / dayTemplate) + ' ' + helper.lang('TIME_AGO.DAY');
      }
    }
    timeAgo.text(displayText);
  }
}