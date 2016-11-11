'use strict';

angular
  .module('IguanaGUIApp.controllers')
  .service('util', [
    '$localStorage',
    '$uibModal',
    '$rootScope',
    'clipboard',
    '$timeout',
    '$interval',
    '$http',
    '$q',
    '$document',
    '$state',
    function($localStorage, $uibModal, $rootScope, clipboard, $timeout, $interval, $http, $q, $document, $state) {
      var self = this;

      this.isIguana = $localStorage['isIguana'];
      this.coinColors = ['orange', 'breeze', 'light-blue', 'yellow'];
      this.defaultSessionLifetime = 0;
      this.portPollUpdateTimeout = settings.portPollUpdateTimeout;
      this.coindWalletLockResults = [];
      this.isExecCopyFailed = false;
      this.coindWalletLockCount = 0;
      this.minEpochTimestamp = 1471620867; // Jan 01 1970

      this.lang = function(langID) {
        var langIDComponents = langID.split('.');

        if (lang && langIDComponents && lang[settings.defaultLang][langIDComponents[0]][langIDComponents[1]])
          return lang[settings.defaultLang][langIDComponents[0]][langIDComponents[1]];
        else if (dev.showConsoleMessages && dev.isDev) console.log('Missing translation in js/' + settings.defaultLang.toLowerCase() + '.js ' + langID);
        return '{{ ' + langID + ' }}';
      };

      this.checkSession = function() {
        var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
          secondsElapsedSinceLastAuth =
          Number(currentEpochTime) - Number(
            ($localStorage['iguana-auth'] ? $localStorage['iguana-auth'].timestamp : 1000) / 1000);

        if (secondsElapsedSinceLastAuth >
          ($localStorage['isIguana'] ? settings.defaultSessionLifetimeIguana :
            settings.defaultSessionLifetimeCoind)) {
          return true;
        } else {
          return false;
        }
      };

      // TODO move to api service
      this.logout = function(noRedirect, cb) {
        if ($localStorage['isIguana']) {
          apiProto.prototype.walletLock();
          $localStorage['iguana-auth'] = { 'timestamp' : this.minEpochTimestamp };
          $state.go('login');
        } else {
          this.coindWalletLockCount = 0;

          if (coinsInfo != undefined)
            for (var key in coinsInfo) {
              if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes') {
                this.coindWalletLockCount++;
              }
            }

          // in case something went bad
          if (this.coindWalletLockCount === 0) {
            $localStorage['iguana-auth'] = { 'timestamp' : this.minEpochTimestamp };
            $state.go('login');
          }

          this.logoutCoind(cb);
        }
      };

      //TODO move to api service
      this.logoutCoind = function(cb) {
        if (coinsInfo != undefined)
          for (var key in coinsInfo) {
            if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes') {
              this.walletLock(key, this.logoutCoindCB(key));
            }
          }
        if (cb) cb();
      };

      //TODO move to api service
      this.logoutCoindCB = function(key) {
        this.coindWalletLockResults[key] = true;
        $localStorage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };

        if (Object.keys(this.coindWalletLockResults).length === this.coindWalletLockCount) {
          $localStorage['iguana-auth'] = { 'timestamp': this.minEpochTimestamp }; // Jan 01 1970
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

      this.constructCoinRepeater = function(coinsInfo) {
        var index = 0,
          addCoinArray = [];

        this.defaultSessionLifetime =
          ($localStorage['isIguana'] ? settings.defaultSessionLifetimeIguana :
            settings.defaultSessionLifetimeCoind);

        for (var key in supportedCoinsList) {
          if (
            (
              !$localStorage['iguana-' + key + '-passphrase'] ||
              (
                $localStorage['iguana-' + key + '-passphrase'] &&
                $localStorage['iguana-' + key + '-passphrase'].logged !== 'yes'
              )
            ) ||
            $state.current.name === 'login' ||
            $state.current.name === 'create-account'
          ) {

            if (coinsInfo == undefined &&
              ($localStorage['isIguana'] && !coinsInfo[key].iguana) ||
              (!$localStorage['isIguana'] && coinsInfo[key].connection === true)
            ) {
              addCoinArray.push({
                'id': key.toUpperCase(),
                'coinId': key.toLowerCase(),
                'name': supportedCoinsList[key].name,
                'color': this.coinColors[index]
              });
              index++;

              if (index === this.coinColors.length - 1) index = 0;
            }
          }
        }

        return addCoinArray;
      };

      this.addCopyToClipboardFromElement = function(element, elementDisplayName) {
        if (!this.isExecCopyFailed) {
          try {
            clipboard.copyText(element.html());
            this.ngPrepMessageModal( // TODO
              elementDisplayName + ' ' + this.lang('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + element.html(),
              'blue',
              true
            );
          } catch (e) {
            this.isExecCopyFailed = true;
            this.ngPrepMessageModal(this.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED'), 'red', true);
          }
        }
      };

      this.ngPrepMessageModal = function(message, color) {
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

      this.setCurrency = function(currencyShortName) {
        $localStorage['iguana-currency'] = { 'name': currencyShortName };

        if (coinsInfo != undefined)
          for (var key in coinsInfo) {
            $localStorage['iguana-rates-' + key] = {
              'shortName': null,
              'value': null,
              'updatedAt': this.minEpochTimestamp,
              'forceUpdate': true
            }; // force currency update
          }
      };

      this.getCurrency = function() {
        return $localStorage['iguana-currency'];
      };

      // TODO ?????
      this.getCursorPositionInputElement = function(element) {
        if (element.selectionStart) return element.selectionStart;

        else if (document.selection) {
          element.focus();
          var r = document.selection.createRange();
          if (r == null) return 0;

          var re = element.createTextRange(),
            rc = re.duplicate();
          re.moveToBookmark(r.getBookmark());
          rc.setEndPoint('EndToStart', re);

          return rc.text.length;
        }

        return 0;
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

      this.convertUnixTime = function(UNIX_timestamp, format) {
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

      // TODO ?????
      this.ratesUpdateElapsedTime = function(coin) {
        if ($localStorage['iguana-rates-' + coin.toLowerCase()]) {
          var currentEpochTime = new Date(Date.now()) / 1000,
            secondsElapsed = Number(currentEpochTime) -
              Number($localStorage['iguana-rates-' + coin.toLowerCase().updatedAt / 1000]);

          return secondsElapsed;
        } else {
          return false;
        }
      };

      this.timeAgo = function(element) {
        //debugger;
        $timeout(function () {
          //debugger;
          if($(element).length){
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
                  displayText = parseInt(difference / minuteTemplate) + ' ' + this.lang('TIME_AGO.MINUTE');
                } else {
                  displayText = this.lang('TIME_AGO.MOMENT');
                }
              } else {
                displayText = parseInt(difference / timeTemplate) + ' ' + this.lang('TIME_AGO.HOURS');
              }
            } else {
              var days = parseInt(difference / dayTemplate);

              if (days > 1) {
                displayText = parseInt(difference / dayTemplate) + ' ' + this.lang('TIME_AGO.DAYS');
              } else {
                displayText = parseInt(difference / dayTemplate) + ' ' + this.lang('TIME_AGO.DAY');
              }
            }
            timeAgo.text(displayText);
          }
        }.bind(this), 100)

      };

      // in seconds
      this.getTimeDiffBetweenNowAndDate = function(from) {
        var currentEpochTime = new Date(Date.now()) / 1000,
          secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

        return secondsElapsed;
      };

      // TODO ?????
      this.checkIfIguanaOrCoindIsPresent = function() {
        var numPortsResponding = 0;

        if (coinsInfo != undefined)
          for (var key in coinsInfo) {
            if (coinsInfo[key].connection === true && coinsInfo[key].coin !== 'undefined') numPortsResponding++;
          }

        if (this.setPortPollResponseDS && ((!$localStorage['isIguana'] && !numPortsResponding) ||
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

      // TODO not completed
      this.prepNoDaemonModal = function() {
        this.ngPrepMessageModal(this.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') +
          ' <a onclick="this.prepRequirementsModal()" class="cursor-pointer">' +
            this.lang('MESSAGE.NO_REQUIRED_DAEMON_P2') +
          '</a> ' +
          this.lang('MESSAGE.NO_REQUIRED_DAEMON_P3') +
          (this.toState.name !== 'login' &&
            this.toState.name !== 'signup' ?
          '<br/><br/><a onclick=\"this.logout()\">' + this.lang('DASHBOARD.LOGOUT') + '</a>' : ''),
          'red', true);
      };

      // TODO useless
      this.getCurrentPage = function() { // obsolete, remove
        return this.toState;
      };

      this.prepRequirementsModal = function() {
        this.ngPrepMessageModal(this.lang('MESSAGE.MINIMUM_DAEMON_CONF'), 'blue', true);

        // "No required daemon is running" message always stays active on top of any ui
        //  this ensures that users won't interact with any elements until connectivity problems are resolved
      };

      // TODO: not handled all states!!!
      function checkUserIdentify(toState) {
        if (!$localStorage['iguana-auth']) {
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