'use strict';

var createHelpers = function($uibModal, $rootScope, clipboard, $timeout, $interval, $state, $localStorage, $document) {
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

      if (secondsElapsedSinceLastAuth > (isIguana ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind)) {
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
    if (isIguana) {
      apiProto.prototype.walletLock();
      $localStorage['iguana-auth'] = { 'timestamp' : minEpochTimestamp };
      $state.go('login');
    } else {
      coindWalletLockCount = 0;

      for (var key in coinsInfo) {
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
    for (var key in coinsInfo) {
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

  this.setCurrency = function(currencyShortName) {
    $localStorage['iguana-currency'] = { 'name' : currencyShortName };

    for (var key in coinsInfo) {
      $localStorage['iguana-rates-' + key] = {
        'shortName' : null,
        'value': null,
        'updatedAt': minEpochTimestamp,
        'forceUpdate': true
      }; // force currency update
    }
  }

  this.getCurrency = function() {
    return $localStorage['iguana-currency'];
  }

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
  }

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
      'isIguana': isIguana,
      'proxy': isProxy,
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
        isIguana = this.setPortPollResponseDS.isIguana;
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

      if (this.setPortPollResponseDS && ((!isIguana && !numPortsResponding) ||
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

        iguanaNullReturnCount = 0;
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

  this.ratesUpdateElapsedTime = function(coin) {
    if ($localStorage['iguana-rates-' + coin.toLowerCase()]) {
      var currentEpochTime = new Date(Date.now()) / 1000,
          secondsElapsed = Number(currentEpochTime) - Number($localStorage['iguana-rates-' + coin.toLowerCase()].updatedAt / 1000);

      return secondsElapsed;
    } else {
      return false;
    }
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
  this.constructCoinRepeater = function() {
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
          (isIguana && coinsInfo[key].iguana !== false) ||
          (!isIguana && coinsInfo[key].connection === true)
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

  this.bindCoinRepeaterSearch = function() {
    var fadeClassName = 'fade',
        overrideOpacityClassName = 'override-opacity',
        supportedCoinsRepeater = $('.supported-coins-repeater'),
        supportedCoinsRepeaterCoin = $('.supported-coins-repeater-inner .coin');

    $('.quick-search .input').keyup(function() {
      var quickSearchVal = $(this).val().toLowerCase();

      supportedCoinsRepeater.addClass(overrideOpacityClassName);
      $('.supported-coins-repeater-inner .coin .name').each(function(index, item) {
        var itemText = $(item).text().toString().toLowerCase();

        if (itemText.indexOf(quickSearchVal) > -1) $(this).parent().removeClass(fadeClassName);
        else $(this).parent().addClass(fadeClassName);
      });

      // fade in elements if nothing was found
      if (supportedCoinsRepeaterCoin.filter('.' + fadeClassName).length === supportedCoinsRepeaterCoin.length ||
          supportedCoinsRepeaterCoin.filter('.' + fadeClassName).length === 0) {
        supportedCoinsRepeaterCoin.filter('.' + fadeClassName).removeClass(fadeClassName);
        supportedCoinsRepeater.removeClass(overrideOpacityClassName);
      }
    });
  }

  /* TODO: move to rates service */
  this.updateRates = function(coin, currency, returnValue, triggerUpdate) {
    var apiExternalRate,
        allDashboardCoins = '',
        totalCoins = 0,
        coinToCurrencyRate = 0,
        defaultCurrency = this.getCurrency() ? this.getCurrency().name : null || settings.defaultCurrency;

    for (var key in coinsInfo) {
      if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes') {
        totalCoins++;
        allDashboardCoins = allDashboardCoins + key.toUpperCase() + ',';
      }
    }

    allDashboardCoins = this.trimComma(allDashboardCoins);

    var ratesUpdateTimeout = settings.ratesUpdateTimeout; // + totalCoins * settings.ratesUpdateMultiply;

    // force rates update
    var isUpdateTriggered = false;

    if (triggerUpdate) {
      for (var key in coinsInfo) {
        if (triggerUpdate && (this.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !$localStorage['iguana-rates-' + key])) {
          if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes') {
            isUpdateTriggered = true;
          }
        }
      }

      if (isUpdateTriggered) {
        api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, this.updateRateCB);
        if (dev.showConsoleMessages && dev.isDev) console.log('rates update in progress...');
      }
    } else {
      if (!coin) coin = defaultCoin;
      if (!currency) currency = defaultCurrency;
      coin = coin.toLowerCase();

      // iguana based rates are temp disabled
      //coinToCurrencyRate = localstorage.getVal('iguana-rates-' + coin).value; //!isIguana ? null : api.getIguanaRate(coin + '/' + currency);
      if (!$localStorage['iguana-rates-' + coin]) api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, this.updateRateCB);
      if (!coinToCurrencyRate && $localStorage['iguana-rates-' + coin]) coinToCurrencyRate = $localStorage['iguana-rates-' + coin].value;
      if (returnValue && $localStorage['iguana-rates-' + coin]) return $localStorage['iguana-rates-' + coin].value;
    }
  }.bind(this);

  this.updateRateCB = function(coin, result) {
    var defaultCurrency = this.getCurrency() ? this.getCurrency().name : null || settings.defaultCurrency;

    for (var key in coinsInfo) {
      if ($localStorage['iguana-' + key + '-passphrase'] && $localStorage['iguana-' + key + '-passphrase'].logged === 'yes' && key) {
        $localStorage['iguana-rates-' + key] = {
          'shortName' : defaultCurrency,
          'value': result[key.toUpperCase()][defaultCurrency.toUpperCase()],
          'updatedAt': Date.now()
        };
      }
    }
  }.bind(this);

  this.getCurrentPage = function() { // obsolete, remove
    return document.location.hash.replace('#', '');
  }

  this.isMobile = function() {
    var widthThreshold = 768; // px

    if ($(window).width <= widthThreshold)
      return true;
    else
      return false;
  }
}