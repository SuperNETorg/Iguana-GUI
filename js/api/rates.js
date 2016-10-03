/*!
 * Iguana api/rates
 *
 */

apiProto.prototype.getIguanaRate = function(quote) {
  var result = false,
      quoteComponents = quote.split('/');

  $.ajax({
    url: apiProto.prototype.getServerUrl(true) + apiProto.prototype.getConf().apiRoutes.iguana.rate + '?base=' + quoteComponents[0] + '&rel=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false
  })
  .done(function(_response) {
    var response = $.parseJSON(_response);

    if (response.error) {
      // do something
      if (dev.showConsoleMessages && dev.isDev) console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'success') result = response.quote;
      else result = false;
    }
  });

  return result;
}

// get a quote form an external source
// cryptonator is officially closed it's gates, no more cors
// keep an eye on, may be they'll change their mind
apiProto.prototype.getExternalRate = function(quote) {
  var result = false,
      firstSourceFailed = false,
      quoteComponents = quote.split('/');

  quote = quote.toLowerCase().replace('/', '-');
  $.ajax({
    url: 'https://min-api.cryptocompare.com/data/price?fsym=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false,
    success: function(_response) {
      var response = $.parseJSON(_response);

      if (response && response[quoteComponents[1]]) {
        result = response[quoteComponents[1]];
        if (dev.showConsoleMessages && dev.isDev) console.log('rates source https://min-api.cryptocompare.com/data/price?fsym=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1]);
      } else {
        result = false;
      }
    },
    error: function(response) {
      console.log('falling back to ext service #2');
      firstSourceFailed = true;
    }
  });

  // ext. rate fallback
  if (firstSourceFailed)
    $.ajax({
      // cryptocoincharts doesn't have direct conversion altcoin -> currency
      // needs 2 requests at a time, one to get btc -> currency rate, another to get btc -> altcoin rate
      url: 'http://api.cryptocoincharts.info/tradingPair/btc_' + quoteComponents[1].toLowerCase(),
      cache: false,
      dataType: 'text',
      async: false,
      success: function(_response) {
        var response = $.parseJSON(_response);

        if (response.price) {
          btcToCurrency = response.price;

          // get btc -> altcoin rate
          $.ajax({
            url: 'https://poloniex.com/public?command=returnTicker',
            cache: false,
            dataType: 'text',
            async: false,
            success: function(_response) {
              var response = $.parseJSON(_response);

              if (response['BTC_' + quoteComponents[0].toUpperCase()]) {
                result = btcToCurrency * response['BTC_' + quoteComponents[0].toUpperCase()].last;
                if (dev.showConsoleMessages && dev.isDev) console.log('rates source http://api.cryptocoincharts.info and https://poloniex.com');
              } else {
                result = false;
              }
            },
            error: function(response) {
              if (dev.showConsoleMessages && dev.isDev) console.log('both services are failed to respond');
            }
          });
        } else {
          result = false;
        }
      },
      error: function(response) {
        if (dev.showConsoleMessages && dev.isDev) console.log('both services failed to respond');
      }
    });

  return result;
}