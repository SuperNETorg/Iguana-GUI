/*!
 * Iguana api/handlers
 *
 */

apiProto.prototype.errorHandler = function(response, index) {
  if (response.error === 'need to unlock wallet') {
    if (helperProto.prototype.getCurrentPage() !== 'index')
      $('#temp-out-of-sync').html('Something went wrong. Please login again.');
      $('#temp-out-of-sync').removeClass('hidden');

      setTimeout(function() {
        helperProto.prototype.logout();
      }, 1000);

    return 10;
  }
  if (response.error === 'iguana jsonstr expired') {
    if (showConsoleMessages && isDev) console.log('server is busy');

    return 10;
  }
  if (response.error === 'coin is busy processing') {
    if ($('#debug-sync-info') && index !== undefined) {
      if (!coinsInfo[index]) coinsInfo[index] = [];
      coinsInfo[index].connection = true;

      if ($('#debug-sync-info').html().indexOf('coin ' + index) === -1)
        $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');
    }

    if (showConsoleMessages && isDev) console.log('server is busy');

    return 10;
  }
  if (response.error === 'null return from iguana_bitcoinRPC') {
    if (showConsoleMessages && isDev) console.log('iguana crashed?');

    return 10;
  }
}