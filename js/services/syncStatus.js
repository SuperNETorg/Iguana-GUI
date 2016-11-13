'use strict';

angular.module('IguanaGUIApp')
.service('$syncStatus', ['$message', '$filter', '$state', function ($message, $filter, $state) {
  this.prepNoDaemonModal = function() { // TODO: move portpoll service
    $message.ngPrepMessageModal($filter('lang')('MESSAGE.NO_REQUIRED_DAEMON_P1') +
      ' <a onclick="this.prepRequirementsModal()" class="cursor-pointer">' +
        $filter('lang')('MESSAGE.NO_REQUIRED_DAEMON_P2') +
      '</a> ' +
      $filter('lang')('MESSAGE.NO_REQUIRED_DAEMON_P3') +
      ($state.current.name !== 'login' &&
        $state.current.name !== 'signup' ?
      '<br/><br/><a onclick=\"this.logout()\">' + $filter('lang')('DASHBOARD.LOGOUT') + '</a>' : ''),
      'red', true);
  };

  this.prepRequirementsModal = function() { // TODO: move portpoll service
    $message.ngPrepMessageModal($filter('lang')('MESSAGE.MINIMUM_DAEMON_CONF'), 'blue', true);

    // "No required daemon is running" message always stays active on top of any ui
    //  this ensures that users won't interact with any elements until connectivity problems are resolved
  };

  this.setPortPollResponse = function() {
    var coinsInfoJSON = [],
        result = false;

    for (var key in coinsInfo) {
      if (key.length > 0 && key !== undefined && key !== 'undefined') {
        coinsInfoJSON.push({
          coin: key,
          connection: coinsInfo[key].connection || false,
          RT: coinsInfo[key].RT || false,
          relayFee: coinsInfo[key].relayFee || 0
        });
      }
    }

    localstorage.setVal('iguana-port-poll', {
      'updatedAt': Date.now(),
      'info': coinsInfoJSON,
      'isIguana': $localStorage['isIguana'],
      'proxy': $localStorage['isProxy'],
      'debugHTML': JSON.stringify($('#debug-sync-info').html())
    });

    if (dev.showConsoleMessages && dev.isDev) console.log('port poll update');
  }

  /* retrieve port poll data */
  this.getPortPollResponse = function() {
    if (this.setPortPollResponseDS) {
      for (var i=0; i < this.setPortPollResponseDS.info.length; i++) {
        coinsInfo[this.setPortPollResponseDS.info[i].coin] = [];
        coinsInfo[this.setPortPollResponseDS.info[i].coin].RT = this.setPortPollResponseDS.info[i].RT;
        coinsInfo[this.setPortPollResponseDS.info[i].coin].connection = this.setPortPollResponseDS.info[i].connection;
        $localStorage['isIguana'] = this.setPortPollResponseDS.isIguana;
      }

      if (dev.isDev && dev.showSyncDebug) { // debug info
        var debugSyncInfo = angular.element(document.getElementById('debug-sync-info')),
            transactionUnit = angular.element(document.getElementsByClassName('transactions-unit')),
            body = angular.element(document.body);

        if (this.setPortPollResponseDS.debugHTML) debugSyncInfo.html(JSON.parse(this.setPortPollResponseDS.debugHTML));
        body.css({ 'padding-bottom': debugSyncInfo.outerHeight() * 1.5 });
        $interval(function() {
          if (transactionUnit) transactionUnit.css({ 'margin-bottom': debugSyncInfo.outerHeight() * 1.5 });
          body.css({ 'padding-bottom':debugSyncInfo.outerHeight() * 1.5 });
        }, 1000);
      }
    }
  }

  this.syncStatus = function() {
    var body = $('body');

    if (dev.isDev && dev.showSyncDebug) {
      body.append('<div id=\"debug-sync-info\" style=\"position:fixed;background:#fff;bottom:0;width:100%;border-top:solid 1px #000;left:0;font-weight:bold;padding:10px 0;text-align:center\">sync info</div>');
      body.css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
    }

    $interval(function() {
      //console.clear();
      apiProto.prototype.testConnection();
    }, portPollUpdateTimeout * 1000);
  }

  this.checkIfIguanaOrCoindIsPresent = function() { // TODO: move portpoll service
    var numPortsResponding = 0;

    if (coinsInfo != undefined)
      for (var key in coinsInfo) {
        if (coinsInfo[key].connection === true && coinsInfo[key].coin !== 'undefined') numPortsResponding++;
      }

    if (this.setPortPollResponseDS && ((!$storage['isIguana'] && !numPortsResponding) ||
      (this.setPortPollResponseDS.isIguana === false &&
      this.setPortPollResponseDS.proxy === true && !numPortsResponding) ||
      (this.setPortPollResponseDS.isIguana === false &&
      this.setPortPollResponseDS.proxy === false))) {
      this.prepNoDaemonModal();

      // logout
      $timeout(function() {
        if (this.toState.name === 'dashboard' || this.toState.name === 'settings') {
          this.logout();
        }
      }, 15000);
    } else {
      // 0.1.1, TODO: switch the below code
      // This property for delete duplicate Timeout functions for message Modal
      /*if (!window.messageModalTime) {
       window.messageModalTime;
       } else {
       clearTimeout(messageModalTime);
       }
       var messageModal = $('#messageModal');
       iguanaNullReturnCount = 0;
       messageModal.removeClass('in');
       messageModalTime = setTimeout(function() {
       messageModal.modal('hide');
       }, 250);*/

      var messageModal = angular.element('#messageModal');

      iguanaNullReturnCount = 0;
      messageModal.removeClass('in');
      setTimeout(function() {
        messageModal.hide();
      }, 250);
    }
  };
}]);