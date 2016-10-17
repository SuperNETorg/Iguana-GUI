/*!
 * Iguana api/iguana-coin
 * coin methods
 *
 */

apiProto.prototype.addCoin = function(coin, cb) {
  var result = false;

  $.ajax({
    url: apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(true).server.port,
    cache: false,
    dataType: 'json',
    type: 'POST',
    data: iguanaAddCoinParams[coin],
    async: cb ? true : false
  })
  .done(function(response) {
    if (dev.showConsoleMessages && dev.isDev) console.log(response)

    if (response.error) {
      // do something
      if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'coin added' || response.result === 'coin already there') result = response;
      else result = false;
    }

    if (cb) cb.call(this, result.result ? result.result : result, coin);
  });

  return result;
}