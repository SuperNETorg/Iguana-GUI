/*!
 * Iguana helpers/time
 *
 */

helperProto.prototype.convertUnixTime = function(UNIX_timestamp, format) {
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
}

helperProto.prototype.ratesUpdateElapsedTime = function(coin) {
  if (localstorage.getVal('iguana-rates-' + coin.toLowerCase())) {
    var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(localstorage.getVal('iguana-rates-' + coin.toLowerCase()).updatedAt / 1000);

    return secondsElapsed;
  } else {
    return false;
  }
}

// in seconds
helperProto.prototype.getTimeDiffBetweenNowAndDate = function(from) {
  var currentEpochTime = new Date(Date.now()) / 1000,
      secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

  return secondsElapsed;
}