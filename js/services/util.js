'use strict';

angular.module('IguanaGUIApp')
.service('util', [
  '$storage',
  '$uibModal',
  '$rootScope',
  'clipboard',
  '$timeout',
  '$interval',
  '$http',
  '$q',
  '$document',
  '$state',
  '$filter',
  function($storage, $uibModal, $rootScope, clipboard, $timeout, $interval, $http, $q, $document, $state, $filter) {
    var self = this;

    this.isIguana = $storage['isIguana'];
    this.defaultSessionLifetime = 0;
    this.portPollUpdateTimeout = settings.portPollUpdateTimeout;
    this.coindWalletLockResults = [];
    this.isExecCopyFailed = false;
    this.coindWalletLockCount = 0;
    this.minEpochTimestamp = 1471620867; // Jan 01 1970

    this.checkSession = function() {
      var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
        secondsElapsedSinceLastAuth =
        Number(currentEpochTime) - Number(
          ($storage['iguana-auth'] ? $storage['iguana-auth'].timestamp : 1000) / 1000);

      if (secondsElapsedSinceLastAuth >
        ($storage['isIguana'] ? settings.defaultSessionLifetimeIguana :
          settings.defaultSessionLifetimeCoind)) {
        return true;
      } else {
        return false;
      }
    };

    this.logout = function(noRedirect, cb) { // TODO: move to auth service
      if ($storage['isIguana']) {
        apiProto.prototype.walletLock();
        $storage['iguana-auth'] = { 'timestamp' : this.minEpochTimestamp };
        $state.go('login');
      } else {
        this.coindWalletLockCount = 0;

        if (coinsInfo != undefined)
          for (var key in coinsInfo) {
            if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
              this.coindWalletLockCount++;
            }
          }

        // in case something went bad
        if (this.coindWalletLockCount === 0) {
          $storage['iguana-auth'] = { 'timestamp' : this.minEpochTimestamp };
          $state.go('login');
        }

        this.logoutCoind(cb);
      }
    };

    //TODO move to api service
    this.logoutCoind = function(cb) {
      if (coinsInfo != undefined)
        for (var key in coinsInfo) {
          if ($storage['iguana-' + key + '-passphrase'] && $storage['iguana-' + key + '-passphrase'].logged === 'yes') {
            this.walletLock(key, this.logoutCoindCB(key));
          }
        }
      if (cb) cb();
    };

    this.logoutCoindCB = function(key) { // TODO: move to auth service
      this.coindWalletLockResults[key] = true;
      $storage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };

      if (Object.keys(this.coindWalletLockResults).length === this.coindWalletLockCount) {
        $storage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp }; // Jan 01 1970
        $state.go('login');
      }
    };

    this.reindexAssocArray = function(array) {
      var _array = [];

      for (var i = 0; array.length > i; i++) {
        if (array[i]) _array.push(array[i]);
      }

      return _array;
    };

    this.addCopyToClipboardFromElement = function(element, elementDisplayName) {
      if (!this.isExecCopyFailed) {
        try {
          clipboard.copyText(element.html());
          this.ngPrepMessageModal( // TODO
            elementDisplayName + ' ' + $filter('lang')('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + element.html(),
            'blue',
            true
          );
        } catch (e) {
          this.isExecCopyFailed = true;
          this.ngPrepMessageModal($filter('lang')('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED'), 'red', true);
        }
      }
    };

    this.ngPrepMessageModal = function(message, color) { // TODO: move to message service
      $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        windowClass: 'iguana-modal message-container msg-' + color,
        template: '<div class="modal-header msgbox-header">' +
                    '<div class="msg-body" data-dismiss="modal">' + message + '</div>' +
                  '</div>',
        resolve: {
          items: function () {
          }
        }
      });
    };

    this.trimComma = function(str) {
      if (str[str.length - 1] === ' ') {
        str = str.replace(/, $/, '');
      }
      if (str[str.length - 1] === ',') {
        str = str.replace(/,$/, '');
      }

      return str;
    };

    this.convertUnixTime = function(UNIX_timestamp, format) { // TODO: move datetime service
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
    };

    this.timeAgo = function(element) { // TODO: move datetime service
      //debugger;
      $timeout(function () {
        //debugger;
        if($(element).length){ // TODO: refactor, no jquery
          var timeAgo = $(element),
            threshold = settings.thresholdTimeAgo,
            displayText = '';

          if (!timeAgo.prop('data-original')) {
            timeAgo.prop('data-original', timeAgo[0].cloneNode(true));
          }

          var timeAgoOriginal = timeAgo.prop('data-original'),
            date = timeAgo.find('.time-ago-date', timeAgoOriginal).text(),
            time = timeAgo.find('.time-ago-time', timeAgoOriginal).text(),
            dateTime = date + ' ' + time,
            original = new Date(dateTime),
            current = new Date(),
            dayTemplate = 24 * 60 * 60 * 1000,
            timeTemplate = 60 * 60 * 1000,
            minuteTemplate = 60 * 1000,
            difference = current - original;

          if ((threshold.hasOwnProperty('day') && (difference / dayTemplate) > threshold.day) ||
            (threshold.hasOwnProperty('time') && (difference / timeTemplate) > threshold.time) ||
            (threshold.hasOwnProperty('minute') && (difference / minuteTemplate) > threshold.minute)) {
            return;
          }
          if (difference / dayTemplate < 1) {
            if (difference / timeTemplate < 1) {
              if (difference / minuteTemplate > 1) {
                displayText = parseInt(difference / minuteTemplate) + ' ' + $filter('lang')('TIME_AGO.MINUTE');
              } else {
                displayText = $filter('lang')('TIME_AGO.MOMENT');
              }
            } else {
              displayText = parseInt(difference / timeTemplate) + ' ' + $filter('lang')('TIME_AGO.HOURS');
            }
          } else {
            var days = parseInt(difference / dayTemplate);

            if (days > 1) {
              displayText = parseInt(difference / dayTemplate) + ' ' + $filter('lang')('TIME_AGO.DAYS');
            } else {
              displayText = parseInt(difference / dayTemplate) + ' ' + $filter('lang')('TIME_AGO.DAY');
            }
          }
          timeAgo.text(displayText);
        }
      }.bind(this), 100)
    };

    // in seconds
    this.getTimeDiffBetweenNowAndDate = function(from) { // TODO: move datetime service
      var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

      return secondsElapsed;
    };

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

    this.prepNoDaemonModal = function() { // TODO: move portpoll service
      this.ngPrepMessageModal($filter('lang')('MESSAGE.NO_REQUIRED_DAEMON_P1') +
        ' <a onclick="this.prepRequirementsModal()" class="cursor-pointer">' +
          $filter('lang')('MESSAGE.NO_REQUIRED_DAEMON_P2') +
        '</a> ' +
        $filter('lang')('MESSAGE.NO_REQUIRED_DAEMON_P3') +
        (this.toState.name !== 'login' &&
          this.toState.name !== 'signup' ?
        '<br/><br/><a onclick=\"this.logout()\">' + $filter('lang')('DASHBOARD.LOGOUT') + '</a>' : ''),
        'red', true);
    };

    this.prepRequirementsModal = function() { // TODO: move portpoll service
      this.ngPrepMessageModal($filter('lang')('MESSAGE.MINIMUM_DAEMON_CONF'), 'blue', true);

      // "No required daemon is running" message always stays active on top of any ui
      //  this ensures that users won't interact with any elements until connectivity problems are resolved
    };

    // TODO: not handled all states!!!
    function checkUserIdentify(toState) {
      if (!$storage['iguana-auth']) {
        this.logout();
      } else {
        if (this.checkSession()) {
          if (toState.name !== 'login') {
            $state.go('login');
          }
        } else {
          if (toState.name !== 'dashboard') {
            $state.go('dashboard');
          }
        }
      }
    }

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
      self['toState'] = toState;
      self['toParams'] = toParams;
      self['fromState'] = fromState;
      self['fromParams'] = fromParams;

      checkUserIdentify.apply(self, [toState, fromState]);
    });
  }
]);