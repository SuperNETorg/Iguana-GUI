/*!
 * Iguana api/handlers
 *
 */

apiProto.prototype.errorHandler = function(response, index) {
  if (response.error === 'need to unlock wallet') {
    if (helperProto.prototype.getCurrentPage() !== 'login')
      (function() {
        helperProto.prototype.prepMessageModal('We\'re sorry but something went wrong while logging you in. Please try again. Redirecting...', 'red', true);
        setTimeout(function() {
          helperProto.prototype.logout();
        }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
        clearInterval(dashboardUpdateTimer);
      })();

    return 10;
  }

  if (response.error === 'iguana jsonstr expired') {
    if (dev.showConsoleMessages && dev.isDev) console.log('server is busy');

    return 10;
  }

  if (response.error === 'coin is busy processing') {
    if (!coinsInfo[index]) coinsInfo[index] = [];
    coinsInfo[index].connection = true;

    if ($('#debug-sync-info') && index !== undefined && dev.isDev && dev.showSyncDebug) {
      if ($('#debug-sync-info').html().indexOf('coin ' + index) === -1 && dev.isDev && dev.showSyncDebug)
        $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');
    }

    if (dev.showConsoleMessages && dev.isDev) console.log('server is busy');

    return 10;
  }

  if (response.error === 'null return from iguana_bitcoinRPC') {
    if (dev.showConsoleMessages && dev.isDev) console.log('iguana crashed?');
    iguanaNullReturnCount++;

    if (iguanaNullReturnCount > settings.iguanaNullReturnCountThreshold) {
      (function() {
        helperProto.prototype.prepMessageModal('We\'re sorry but it seems that Iguana has crashed. Please login again. Redirecting...', 'red', true);
        setTimeout(function() {
          helperProto.prototype.logout();
        }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
        clearInterval(dashboardUpdateTimer);
      })();
    }

    return 10;
  }

  if (response.responseText && response.responseText.indexOf(':-13') > -1) {
    return -13;
  }
}