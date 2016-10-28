/*!
 * Iguana helpers/port-poll
 *
 */

/* store port poll data */
helperProto.prototype.setPortPollResponse = function() {
  var coinsInfoJSON = [],
      result = false;

  for (var key in coinsInfo) {
    if (key.length > 0 && key !== undefined && key !== 'undefined') {
      coinsInfoJSON.push({ coin: key,
                           connection: coinsInfo[key].connection || false,
                           RT: coinsInfo[key].RT || false,
                           relayFee: coinsInfo[key].relayFee || 0 });
    }
  }

  localstorage.setVal('iguana-port-poll', { 'updatedAt': Date.now(),
                                            'info': coinsInfoJSON,
                                            'isIguana': isIguana,
                                            'proxy': isProxy,
                                            'debugHTML': JSON.stringify($('#debug-sync-info').html()) });

  if (dev.showConsoleMessages && dev.isDev) console.log('port poll update');
}

/* retrieve port poll data */
helperProto.prototype.getPortPollResponse = function() {
  if (setPortPollResponseDS) {
    for (var i=0; i < setPortPollResponseDS.info.length; i++) {
      coinsInfo[setPortPollResponseDS.info[i].coin] = [];
      coinsInfo[setPortPollResponseDS.info[i].coin].RT = setPortPollResponseDS.info[i].RT;
      coinsInfo[setPortPollResponseDS.info[i].coin].connection = setPortPollResponseDS.info[i].connection;
      isIguana = setPortPollResponseDS.isIguana;
    }

    if (dev.isDev && dev.showSyncDebug) { // debug info
      var debugSyncInfo = $('#debug-sync-info'),
          transactionUnit = $('.transactions-unit'),
          body = $('body');

      if (setPortPollResponseDS.debugHTML) debugSyncInfo.html(JSON.parse(setPortPollResponseDS.debugHTML));
      body.css({ 'padding-bottom': debugSyncInfo.outerHeight() * 1.5 });
      setInterval(function() {
        if (transactionUnit) transactionUnit.css({ 'margin-bottom': debugSyncInfo.outerHeight() * 1.5 });
        body.css({ 'padding-bottom':debugSyncInfo.outerHeight() * 1.5 });
      }, 1000);
    }
  }
}