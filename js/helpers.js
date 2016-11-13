'use strict';

var createHelpers = function($uibModal, $rootScope, clipboard, $timeout, $interval, $state, $localStorage, vars, $document) {
  var defaultSessionLifetime = settings.defaultSessionLifetime,
      portPollUpdateTimeout = settings.portPollUpdateTimeout,
      pasteTextFromClipboard = false,// TODO useless
      isExecCopyFailed = false,// TODO useless
      coindWalletLockResults = [],
      coindWalletLockCount = 0,
      minEpochTimestamp = 1471620867; // Jan 01 1970

  this.defaultSessionLifetime = defaultSessionLifetime;
  this.portPollUpdateTimeout = portPollUpdateTimeout;

  this.checkSession = function(returnVal) {
    var loginForm = $('.login-form');

    if (!$localStorage['iguana-auth']) {
      this.logout();
    } else {
      var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
          secondsElapsedSinceLastAuth = Number(currentEpochTime) - Number($localStorage['iguana-auth'].timestamp / 1000);

      if (secondsElapsedSinceLastAuth > ($localStorage['isIguana'] ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind)) {
        if (!returnVal) {
          //if (!loginForm.width()) this.openPage('login'); // redirect to login when session is expired
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  };

  this.logout = function(noRedirect, cb) {
    if ($localStorage['isIguana']) {
      apiProto.prototype.walletLock();
      $localStorage['iguana-auth'] = { 'timestamp' : minEpochTimestamp };
      $state.go('login');
    } else {
      coindWalletLockCount = 0;

      for (var key in vars['coinsInfo']) {
        if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes') {
          coindWalletLockCount++;
        }
      }

      // in case something went bad
      if (coindWalletLockCount === 0) {
        $localStorage['iguana-auth'] = { 'timestamp' : minEpochTimestamp };
        $state.go('login');
      }

      this.logoutCoind(cb);
    }
  }

  this.logoutCoind = function(cb) {
    for (var key in vars['coinsInfo']) {
      if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes') {
        apiProto.prototype.walletLock(key, this.logoutCoindCB(key));
      }
    }
    if (cb) cb.call();
  }

  this.logoutCoindCB = function(key) {
    coindWalletLockResults[key] = true;
    $localStorage['iguana-' + key + '-passphrase'] = { 'logged': 'no' };

    if (Object.keys(coindWalletLockResults).length === coindWalletLockCount) {
      $localStorage['iguana-auth'] = { 'timestamp' : minEpochTimestamp }; // Jan 01 1970
      $state.go('login');
    }
  }

  this.addCopyToClipboardFromElement = function(element, elementDisplayName) {
    if (!isExecCopyFailed) {
      try {
        clipboard.copyText(element.html());
        this.ngPrepMessageModal( //TODO
          elementDisplayName + ' ' + this.lang('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + element.html(),
          'blue',
          true
        );
        pasteTextFromClipboard = element.html();
      } catch (e) {
        isExecCopyFailed = true;
        this.ngPrepMessageModal(this.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED'), 'red', true);
      }
    }
  }
  .bind(this);

  /* TODO: 1) filter
           2) add array to obj and obj to array conversion(?)
  */
  this.reindexAssocArray = function(array) {
    var _array = [];

    for (var i = 0; array.length > i; i++) {
      if (array[i]) _array.push(array[i]);
    }

    if (!_array.length) // legacy support, remove after dashboard is refactored
      for (var key in array) {
        if (array[key]) _array.push(key);
      }

    return _array;
  };

  this.trimComma = function(str) {
    if (str[str.length - 1] === ' ') {
      str = str.replace(/, $/, '');
    }
    if (str[str.length - 1] === ',') {
      str = str.replace(/,$/, '');
    }

    return str;
  }

  this.lang = function(langID) {
    var langIDComponents = langID.split('.');

    if (lang && langIDComponents && lang[settings.defaultLang][langIDComponents[0]][langIDComponents[1]])
      return lang[settings.defaultLang][langIDComponents[0]][langIDComponents[1]];
    else
      if (dev.showConsoleMessages && dev.isDev) console.log('Missing translation in js/' +  settings.defaultLang.toLowerCase() + '.js ' + langID);
      return '{{ ' + langID + ' }}';
  }

  this.initMessageModal = function() {} // TODO: remove

  this.prepMessageModal = function(message, color, fireModal) {
    var messageModal = $('#messageModal');

    messageModal.removeClass('msg-red').removeClass('msg-blue').removeClass('msg-green');
    messageModal.addClass('msg-' + color);
    $('#messageModal .msg-body').html(message);

    if (fireModal) {
      messageModal.show().removeClass('fade');
      //messageModal.modal('show'); // 0.1.1
    }
  }

  this.ngPrepMessageModal = function (message, color, fireModal) {
   $uibModal.open({
     animation: true,
     ariaLabelledBy: 'modal-title',
     ariaDescribedBy: 'modal-body',
     windowClass: 'iguana-modal message-container msg-' + color,
     template: '<div class="modal-header msgbox-header">' +
                 '<div class="msg-body" data-dismiss="modal">' + message + '</div>' +
               '</div>',

     // controller: 'signupController',
     resolve: {
       items: function () {
       }
     }
   });
  };

  this.closeMessageModal = function() {
    $('#messageModal').hide();
  }

  this.prepNoDaemonModal = function() {
    $('#messageModal').off();
    this.prepMessageModal(this.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') +
      ' <a onclick="this.prepRequirementsModal()" class="cursor-pointer">' + this.lang('MESSAGE.NO_REQUIRED_DAEMON_P2') + '</a> ' + this.lang('MESSAGE.NO_REQUIRED_DAEMON_P3') +
      (this.getCurrentPage() !== 'login' &&
      this.getCurrentPage() !== 'signup' ? '<br/><br/><a onclick=\"this.logout()\">' + this.lang('DASHBOARD.LOGOUT') + '</a>' : ''), 'red', true);
  }

  this.prepRequirementsModal = function() {
    this.prepMessageModal(this.lang('MESSAGE.MINIMUM_DAEMON_CONF'), 'blue', true);

    // "No required daemon is running" message always stays active on top of any ui
    //  this ensures that users won't interact with any elements until connectivity problems are resolved
  }

  /**
   * //TODO this function instance another 'PortPoll' service
   * */
  /* store port poll data */
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

  /**
   * //TODO this function instance another 'PortPoll' service
   * */
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

  this.checkIfIguanaOrCoindIsPresent = function() {
      var numPortsResponding = 0;

      for (var key in coinsInfo) {
        if (coinsInfo[key].connection === true && coinsInfo[key].coin !== 'undefined') numPortsResponding++;
      }

      if (this.setPortPollResponseDS && ((!$localStorage['isIguana'] && !numPortsResponding) ||
          (this.setPortPollResponseDS.isIguana === false && this.setPortPollResponseDS.proxy === true && !numPortsResponding) ||
          (this.setPortPollResponseDS.isIguana === false && this.setPortPollResponseDS.proxy === false))) {
        this.prepNoDaemonModal();

        // logout
        $timeout(function() {
          if (this.getCurrentPage() === 'dashboard' || this.getCurrentPage() === 'settings') {
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

        var messageModal = $('#messageModal');

        $localStorage['activeCoin'] = 0; //ToDo fixed in the helper service
        messageModal.removeClass('in');
        setTimeout(function() {
          messageModal.hide();
        }, 250);
      }
  }.bind(this)

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
  }

  this.timeAgo = function() {
    var timesAgo = $('.time-ago', document),
        threshold = settings.thresholdTimeAgo,
        timeAgo,
        displayText = '';

    for (var i = 0; timesAgo.length > i; i++) {
      timeAgo = $(timesAgo[i]);

      if (!timeAgo.prop('data-original')) {
        timeAgo.prop('data-original', timeAgo.clone());
      }

      var timeAgoOriginal = timeAgo.prop('data-original'),
          date = $('.time-ago-date', timeAgoOriginal).text(),
          time = $('.time-ago-time', timeAgoOriginal).text(),
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
            displayText = parseInt(difference / minuteTemplate) + ' ' + helper.lang('TIME_AGO.MINUTE');
          } else {
            displayText = helper.lang('TIME_AGO.MOMENT');
          }
        } else {
          displayText = parseInt(difference / timeTemplate) + ' ' + helper.lang('TIME_AGO.HOURS');
        }
      } else {
        var days = parseInt(difference / dayTemplate);

        if (days > 1) {
          displayText = parseInt(difference / dayTemplate) + ' ' + helper.lang('TIME_AGO.DAYS');
        } else {
          displayText = parseInt(difference / dayTemplate) + ' ' + helper.lang('TIME_AGO.DAY');
        }
      }
      timeAgo.text(displayText);
    }
  }

  // in seconds
  this.getTimeDiffBetweenNowAndDate = function(from) {
    var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

    return secondsElapsed;
  }

  this.toggleModalWindow = function(formClassName, timeout) {
    // 0.1.1, doesn't work well
    /*var modalWindow = $('.' + formClassName),
        viewportWidth = $(window).width(),
        formContainer = modalWindow.closest('.form-container'),
        mainContainer = $('.main');

    if (modalWindow.hasClass('fade')) {
      modalWindow.removeClass('hidden').removeClass('blur');
      mainContainer.addClass('blur');
      formContainer.addClass('blur');

      setTimeout(function() {
        $('body').addClass('modal-open');
        modalWindow.removeClass('fade');
      }, 10);
    } else {
      modalWindow.addClass('fade');
      formContainer.removeClass('blur');

      setTimeout(function() {
        modalWindow.addClass('hidden').addClass('fade');
        formContainer.removeClass('blur');
        if (formContainer.length === formContainer.not(":visible").length) mainContainer.removeClass('blur');
        if ($('.form-container:not(.hidden)').length == 0) $('body').removeClass('modal-open');
      }, timeout);
    }*/

    var modalWindow = $('.' + formClassName),
        viewportWidth = $(window).width(),
        formContainer = $('.form-container'),
        mainContainer = $('.main');

    if (modalWindow.hasClass('fade')) {
      modalWindow.removeClass('hidden');
      mainContainer.addClass('blur');
      formContainer.addClass('blur');
      modalWindow.removeClass('blur');

      $timeout(function() {
        modalWindow.removeClass('fade');
      }, 10);
    } else {
      modalWindow.addClass('fade');
      formContainer.removeClass('blur');

      $timeout(function() {
        modalWindow.addClass('hidden');
        modalWindow.addClass('fade');
        formContainer.removeClass('blur');
        if (formContainer.length === formContainer.not(":visible").length) mainContainer.removeClass('blur');
      }, timeout);
    }
  }

  /* TODO: move to directive or service */
  var addCoinColors = ['orange', 'breeze', 'light-blue', 'yellow'],
      coinsSelectedToAdd = [];

  this.addCoinButtonCB = function() {

    coinsSelectedToAdd = [];

    angular.element(document.querySelector('.supported-coins-repeater-inner')).html(this.constructCoinRepeater());

    return this.constructCoinRepeater();
  }.bind(this);

  // construct coins to add array
  this.constructCoinRepeater = function(coinsInfo) {
    var index = 0,
        addCoinArray = new Array;

    for (var key in supportedCoinsList) {
      if (
        (!$localStorage['iguana-' + key + '-passphrase'] ||
        ($localStorage['iguana-' + key + '-passphrase'] &&
        $localStorage['iguana-' + key + '-passphrase'].logged !== 'yes')) ||
        $state.current.name === 'login' ||
        $state.current.name === 'create-account'
      ) {
        if (
          ($localStorage['isIguana'] && coinsInfo[key].iguana !== false) ||
          (!$localStorage['isIguana'] && coinsInfo[key].connection === true)
        ) {
          addCoinArray.push({
            'id': key.toUpperCase(),
            'coinId': key.toLowerCase(),
            'name': supportedCoinsList[key].name,
            'color': addCoinColors[index]
          });
          if (index === addCoinColors.length - 1) index = 0;
          else index++;
        }
      }
    }

    return addCoinArray;
  }

  this.isMobile = function() {
    var widthThreshold = 768; // px

    if ($(window).width <= widthThreshold)
      return true;
    else
      return false;
  }

  this.initTopNavBar = function () {
    if ($(window).width() < 768) {
      var topMenu = $('#top-menu'),
          btnLeft = $('.nav-buttons .nav-left', topMenu),
          btnRight = $('.nav-buttons .nav-right', topMenu),
          items = $('.item', topMenu), itemsLength = 0, item;

      btnLeft.on('click swipeleft', function() {
        if ($(window).width() < $('.top-menu', topMenu).width()) {
          itemsLength = $('.top-menu', topMenu).width();
          for (var i = items.length - 1; 0 <= i; i--) {
            item = $(items[i]);
            itemsLength -= $(items[i]).width();
            if ($(items[i]).offset().left + $(items[i]).width() < $('.top-menu', topMenu).width() && itemsLength > $(items[i]).width()) {
              item.closest('.navbar-nav').animate({'margin-left':
              parseFloat(item.closest('.navbar-nav').css('margin-left')) + $(items[i]).width()}, "slow");
              itemsLength = 0;
              break;
            } else {
              return;
            }
          }
        }
      });
      btnRight.on('click swiperight', function() {
        if ($(window).width() < $('.top-menu', topMenu).width())
          for (var i = 0; items.length > i; i++) {
            item = $(items[i]);
            itemsLength += $(items[i]).offset().left;
            if ($(items[i]).offset().left < topMenu.width() && itemsLength > topMenu.width()) {
              item.closest('.navbar-nav').animate({'margin-left':
                (parseFloat(item.closest('.navbar-nav').css('margin-left')) - $(items[i]).width())}, "slow");
              itemsLength = 0;
              break;
            }
          }
      });
    }
  }
}