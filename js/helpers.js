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

    //api.testConnection();

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

  this.logout = function(noRedirect) {
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

      this.logoutCoind();
    }
  }

  this.logoutCoind = function() {
    for (var key in coinsInfo) {
      if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
        apiProto.prototype.walletLock(key, this.logoutCoindCB(key));
      }
    }
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
    var valueComponents = value.toString().split('.');

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
        _array[index] = value;
        index++;
      }
    });

    return _array;
  }

  this.trimComma = function(str) {
    if (str[str.length - 1] === ' ') {
      str = str.replace(/, $/, '');
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

    body.append(templates.all.messageModal);

  }

  this.prepMessageModal = function(message, color, fireModal) {
    var messageModal = $('#messageModal');

    messageModal.removeClass('msg-red').removeClass('msg-blue').removeClass('msg-green');
    messageModal.addClass('msg-' + color);
    $('#messageModal .msg-body').html(message);

    if (fireModal) {
      //messageModal.modal('show');
    }
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
    var body = $('body');

    body.removeClass('modal-open');
    /*if (dashboardUpdateTimer) {
      clearInterval(dashboardUpdateTimer);
    }*/

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
}