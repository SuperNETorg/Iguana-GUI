/*!
 * Iguana helpers/sync-status
 *
 */

helperProto.prototype.syncStatus = function() {
  $(document).ready(function() {
    var body = $('body');

    if (dev.isDev && dev.showSyncDebug) {
      body.append('<div id=\"debug-sync-info\" style=\"position:fixed;background:#fff;bottom:0;width:100%;border-top:solid 1px #000;left:0;font-weight:bold;padding:10px 0;text-align:center\">sync info</div>');
      body.css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
    }

    setInterval(function() {
      //console.clear();
      apiProto.prototype.testConnection();
    }, portPollUpdateTimeout * 1000);
  });
}

helperProto.prototype.checkIfIguanaOrCoindIsPresent = function() {
  $(document).ready(function() {
    var numPortsResponding = 0;

    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true && coinsInfo[key].coin !== 'undefined') numPortsResponding++;
    }

    if (setPortPollResponseDS && ((!isIguana && !numPortsResponding) ||
        (setPortPollResponseDS.isIguana === false && setPortPollResponseDS.proxy === true && !numPortsResponding) ||
        (setPortPollResponseDS.isIguana === false && setPortPollResponseDS.proxy === false))) {
      helperProto.prototype.prepNoDaemonModal();

      // logout
      setTimeout(function() {
        if (helperProto.prototype.getCurrentPage() === 'dashboard' || helperProto.prototype.getCurrentPage() === 'settings') {
          helperProto.prototype.logout();
        }
      }, 15000);
    } else {
      var messageModal = $('#messageModal');

      iguanaNullReturnCount = 0;
      messageModal.removeClass('in');
      setTimeout(function() {
        messageModal.hide();
      }, 250);
    }
  });
}

helperProto.prototype.syncStatus();