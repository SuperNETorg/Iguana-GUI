'use strict';

var createHelpers = function() {
  var defaultSessionLifetime = settings.defaultSessionLifetime,
      portPollUpdateTimeout = settings.portPollUpdateTimeout,
      pasteTextFromClipboard = false,
      isExecCopyFailed = false,
      coindWalletLockResults = [],
      coindWalletLockCount = 0,
      minEpochTimestamp = 1471620867; // Jan 01 1970

  this.defaultSessionLifetime = defaultSessionLifetime;
  this.portPollUpdateTimeout = portPollUpdateTimeout;

  this.checkSession = function(returnVal) {
    var loginForm = $('.login-form');

    if (!localstorage.getVal('iguana-auth')) {
      this.logout();
    } else {
      var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
          secondsElapsedSinceLastAuth = Number(currentEpochTime) - Number(localstorage.getVal('iguana-auth').timestamp / 1000);

      if (secondsElapsedSinceLastAuth > (isIguana ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind)) {
        if (!returnVal) {
          if (!loginForm.width()) this.openPage('login'); // redirect to login when session is expired
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
      localstorage.setVal('iguana-auth', { 'timestamp' : minEpochTimestamp });
      this.openPage('login');
    } else {
      coindWalletLockCount = 0;

      for (var key in coinsInfo) {
        if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
          coindWalletLockCount++;
        }
      }

      // in case something went bad
      if (coindWalletLockCount === 0) {
        localstorage.setVal('iguana-auth', { 'timestamp' : minEpochTimestamp });
        this.openPage('login');
      }

      this.logoutCoind(cb);
    }
  }

  this.logoutCoind = function(cb) {
    for (var key in coinsInfo) {
      if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
        apiProto.prototype.walletLock(key, this.logoutCoindCB(key));
      }
    }
    if (cb) cb.call();
  }

  this.logoutCoindCB = function(key) {
    coindWalletLockResults[key] = true;
    localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });

    if (Object.keys(coindWalletLockResults).length === coindWalletLockCount) {
      localstorage.setVal('iguana-auth', { 'timestamp' : minEpochTimestamp }); // Jan 01 1970
      this.openPage('login');
    }
  }

  this.addCopyToClipboardFromElement = function(elementId, elementDisplayName) {
    var hiddenElementId = 'hidden';

    $(elementId).off();
    $(elementId).click(function() {
      if (!isExecCopyFailed)
        try {
          $(elementId + '-' + hiddenElementId).select();
          document.execCommand('copy');
          this.prepMessageModal(elementDisplayName + ' ' + this.lang('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + $(elementId + '-' + hiddenElementId).val(), 'blue', true);
          pasteTextFromClipboard = $(elementId + '-' + hiddenElementId).val();
        } catch(e) {
          isExecCopyFailed = true;
          this.prepMessageModal(this.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED'), 'red', true);
        }
    });
  }

  this.setCurrency = function(currencyShortName) {
    localstorage.setVal('iguana-currency', { 'name' : currencyShortName });

    for (var key in coinsInfo) {
      localstorage.setVal('iguana-rates-' + key, { 'shortName' : null,
                                                   'value': null,
                                                   'updatedAt': minEpochTimestamp,
                                                   'forceUpdate': true }); // force currency update
    }
  }

  this.getCurrency = function() {
    return localstorage.getVal('iguana-currency');
  }

  // format a number
  this.decimalPlacesFormat = function(value) {
    var valueComponents = value.toString().split('.'),
        decimalPlacesCoin = 0,
        decimalPlacesCurrency = 0;

    if (value < 1 && value > 0) {

      for (var i=0; i < valueComponents[1].length; i++) {
        if (Number(valueComponents[1][i]) !== 0) {
          decimalPlacesCoin = i + 2;
          decimalPlacesCurrency = decimalPlacesCoin;
          break;
        }
      }
    } else {
      decimalPlacesCoin = settings.decimalPlacesCoin;
      decimalPlacesCurrency = settings.decimalPlacesCurrency;
    }

    if (!valueComponents[1]) { // show only the whole number if right part eq zero
      decimalPlacesCoin = decimalPlacesCurrency = 0;
    }

    return { 'coin': decimalPlacesCoin, 'currency': decimalPlacesCurrency };
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

  this.reindexAssocArray = function(array) {
    var _array = [],
        index = 0;

    $.each(array, function(key, value) {
      if (value) {
        _array[index] = key;
        index++;
      }
    });

    return _array;
  }

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

  this.initMessageModal = function() {
    var body = $('body'),
        messageModal = '#messageModal';

    //body.append(templates.all.messageModal);
  }

  this.prepMessageModal = function(message, color, fireModal) {
    var messageModal = $('#messageModal');

    messageModal.removeClass('msg-red').removeClass('msg-blue').removeClass('msg-green');
    messageModal.addClass('msg-' + color);
    $('#messageModal .msg-body').html(message);

    if (fireModal) {
      messageModal.show().removeClass('fade');
    }
  }

  this.closeMessageModal = function() {
    $('#messageModal').hide();
  }

  this.prepNoDaemonModal = function() {
    $('#messageModal').off();
    this.prepMessageModal(this.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') +
      ' <a onclick="this.prepRequirementsModal()" class="cursor-pointer">' + this.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') + '</a>' +
      (this.getCurrentPage() !== 'login' &&
      this.getCurrentPage() !== 'create-account' ? '<br/><br/><a onclick=\"this.logout()\">' + this.lang('DASHBOARD.LOGOUT') + '</a>' : ''), 'red', true);
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
  this.getPortPollResponse = function() {
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

  this.openPage = function(url) {
    /*var body = $('body');

    body.removeClass('modal-open');
    if (dashboardUpdateTimer) {
      clearInterval(dashboardUpdateTimer);
    }

    if (this.checkSession(true) && url !== 'dashboard' && url !== 'settings') {
      url = document.location.hash.replace('#', '');
    }

    switch (url) {
      case 'login':
        iguanaNullReturnCount = 0;
        body.html(loginFormPrepTemplate()).
             removeClass('dashboard-page');
        initAuthCB();
        break;
      case 'create-account':
        body.html(signupFormPrepTemplate()).
             removeClass('dashboard-page');
        initAuthCB();
        break;
      case 'dashboard':
        defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;
        var temp = templates.all.dashboard.
                   replace(/{{ currency }}/g, defaultCurrency).
                   replace('{{ injectLoader }}', templates.all.loader);
        body.addClass('dashboard-page').
             html(temp);
        initDashboard();
        break;
      case 'settings':
        body.addClass('dashboard-page').
             html(templates.all.referenceCurrency);
        initReferenceCurrency();
        break;
    }
    this.initPageUrl(url);
    */
    this.checkIfIguanaOrCoindIsPresent();
  }

  this.getCurrentPage = function() {
    return document.location.hash.replace('#', '');
  }

  this.initPageUrl = function(url) {
    document.location.hash = '#' + url;
    document.title = 'Iguana / ' + url.replace(url[0], url[0].toUpperCase()).replace('-', ' ');
  }

  this.syncStatus = function() {
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

  this.checkIfIguanaOrCoindIsPresent = function() {
    $(document).ready(function() {
      var numPortsResponding = 0;

      for (var key in coinsInfo) {
        if (coinsInfo[key].connection === true && coinsInfo[key].coin !== 'undefined') numPortsResponding++;
      }

      if (setPortPollResponseDS && ((!isIguana && !numPortsResponding) ||
          (setPortPollResponseDS.isIguana === false && setPortPollResponseDS.proxy === true && !numPortsResponding) ||
          (setPortPollResponseDS.isIguana === false && setPortPollResponseDS.proxy === false))) {
        this.prepNoDaemonModal();

        // logout
        setTimeout(function() {
          if (this.getCurrentPage() === 'dashboard' || this.getCurrentPage() === 'settings') {
            this.logout();
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
    if (localstorage.getVal('iguana-rates-' + coin.toLowerCase())) {
      var currentEpochTime = new Date(Date.now()) / 1000,
          secondsElapsed = Number(currentEpochTime) - Number(localstorage.getVal('iguana-rates-' + coin.toLowerCase()).updatedAt / 1000);

      return secondsElapsed;
    } else {
      return false;
    }
  }

  // in seconds
  this.getTimeDiffBetweenNowAndDate = function(from) {
    var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

    return secondsElapsed;
  }

  this.toggleModalWindow = function(formClassName, timeout) {
    var modalWindow = $('.' + formClassName),
        viewportWidth = $(window).width(),
        formContainer = $('.form-container'),
        mainContainer = $('.main');

    if (modalWindow.hasClass('fade')) {
      modalWindow.removeClass('hidden');
      mainContainer.addClass('blur');
      formContainer.addClass('blur');
      modalWindow.removeClass('blur');

      setTimeout(function() {
        modalWindow.removeClass('fade');
      }, 10);
    } else {
      modalWindow.addClass('fade');
      formContainer.removeClass('blur');

      setTimeout(function() {
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
    var supportedCoinsRepeaterClassName = '.supported-coins-repeater',
        addNewCoinForm = $('.add-new-coin-form'),
        fadeClassName = 'fade';

    coinsSelectedToAdd = [];

    if (!addNewCoinForm.hasClass(fadeClassName)) addNewCoinForm.addClass(fadeClassName);
    this.toggleModalWindow('add-new-coin-form', 300);

    //$(supportedCoinsRepeaterClassName + '-inner').html(this.constructCoinRepeater());

    return this.constructCoinRepeater();
  }

  // construct coins to add array
  this.constructCoinRepeater = function() {
    var index = 0,
        addCoinArray = {};

    for (var key in supportedCoinsList) {
      if ((!localstorage.getVal('iguana-' + key + '-passphrase') || (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes')) || helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
        if ((isIguana && coinsInfo[key].iguana !== false) || (!isIguana && coinsInfo[key].connection === true)) {
            addCoinArray[key] = {
              'id': key.toUpperCase(),
              'coinId': key.toLowerCase(),
              'name': supportedCoinsList[key].name,
              'color': addCoinColors[index]
            };
            index++;
            if (index === addCoinColors.length - 1) index = 0;
          }
      }
    }

    return addCoinArray;
  }

  this.opacityToggleOnAddCoinRepeaterScroll = function() {
    var supportedCoinsRepeater = $('.supported-coins-repeater');

    if (supportedCoinsRepeater.html()) {
      var supportedCoinsRepeaterScrollPos = supportedCoinsRepeater.scrollTop() || 0,
          // height + margin top + margin bottom
          supportedCoinsRepeaterHeight = supportedCoinsRepeater.height() + Number(supportedCoinsRepeater.css('padding').replace('px', '')) * 2,
          lowerThreshold = supportedCoinsRepeaterScrollPos + supportedCoinsRepeaterHeight;

      $('.supported-coins-repeater .coin').each(function(index, item) {
        // opacity change kicks in at around the middle of a tile line
        var elHeight = $(this).outerHeight() + Number($(this).css('margin').replace('px', '')) * 2, // height + margin top + margin bottom
            elAbsoluteTopPos = elHeight * 2 + Number($(this).css('paddingTop').replace('px', '')),
            elTop = Math.floor($(this).offset().top + supportedCoinsRepeaterScrollPos - elAbsoluteTopPos), // first line of tiles should have 0 top pos
            elBottom = Math.floor($(this).offset().top + supportedCoinsRepeaterScrollPos - elAbsoluteTopPos + elHeight); // bottom = top + el height

        if (elTop + Math.floor(elHeight / 1.5) <= supportedCoinsRepeaterScrollPos || elBottom - Math.floor(elHeight / 3.5) >= lowerThreshold) {
          $(this).css({ 'opacity': 0.2 }); // shortcut, better to use css class
        } else {
          $(this).css({ 'opacity': 1 });
        }
      });
    }
  }

  this.bindClickInCoinRepeater = function() {
    var activeClassName = 'active',
        disabledClassName = 'disabled',
        supportedCoinsRepeaterCoin = $('.supported-coins-repeater-inner .coin'),
        buttonNext = $('.btn-next');

    supportedCoinsRepeaterCoin.each(function(index, item) {
      $(this).click(function() {
        var selectionStatus = $(this).hasClass(activeClassName) ? true : false;

        if (!isIguana || helper.getCurrentPage() === 'create-account') {
          supportedCoinsRepeaterCoin.removeClass(activeClassName);
          coinsSelectedToAdd = [];
        }

        if ($(this).hasClass(activeClassName)) {
          delete coinsSelectedToAdd[index];
          $(this).removeClass(activeClassName);
        } else {
          $(this).addClass(activeClassName);
          coinsSelectedToAdd[index] = $(this).attr('data-coin-id');
        }

        // TODO(?): rewrite

        if (selectionStatus) {
          $(this).removeClass(activeClassName);
          buttonNext.addClass(disabledClassName);
        } else {
          $(this).addClass(activeClassName);
          buttonNext.removeClass(disabledClassName);
        }
      });
    });
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
        this.opacityToggleOnAddCoinRepeaterScroll();
      }
    });
  }

  /* TODO: move to rates service */
  this.updateRates = function(coin, currency, returnValue, triggerUpdate) {
    var apiExternalRate,
        allDashboardCoins = '',
        totalCoins = 0,
        coinToCurrencyRate = 0,
        defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency;

    for (var key in coinsInfo) {
      if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
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
        if (triggerUpdate && (this.ratesUpdateElapsedTime(key.toUpperCase()) >= ratesUpdateTimeout || !localstorage.getVal('iguana-rates-' + key))) {
          if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
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
      if (!localstorage.getVal('iguana-rates-' + coin)) api.getExternalRate(allDashboardCoins + '/' + defaultCurrency, updateRateCB);
      if (!coinToCurrencyRate && localstorage.getVal('iguana-rates-' + coin)) coinToCurrencyRate = localstorage.getVal('iguana-rates-' + coin).value;
      if (returnValue && localstorage.getVal('iguana-rates-' + coin)) return localstorage.getVal('iguana-rates-' + coin).value;
    }
  }

  this.updateRateCB = function(coin, result) {
    var defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency;

    for (var key in coinsInfo) {
      if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes' && key) {
        localstorage.setVal('iguana-rates-' + key, { 'shortName' : defaultCurrency, 'value': result[key.toUpperCase()][defaultCurrency.toUpperCase()], 'updatedAt': Date.now() });
      }
    }

    //if (helper.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
  }
}