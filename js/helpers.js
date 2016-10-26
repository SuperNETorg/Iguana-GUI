/*!
 * Iguana helpers
 * info: various reusable functions go here
 */

var helperProto = function() {};

var defaultSessionLifetime = settings.defaultSessionLifetime,
    portPollUpdateTimeout = settings.portPollUpdateTimeout,
    pasteTextFromClipboard = false,
    isExecCopyFailed = false,
    coindWalletLockResults = [],
    coindWalletLockCount = 0;

helperProto.prototype.convertUnixTime = function(UNIX_timestamp, format) {
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

helperProto.prototype.reindexAssocArray = function(array) {
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

//TODO: This is a temporal solution until the Bootstrap modal is integrated.
helperProto.prototype.toggleModalWindow = function(formClassName, timeout) {
  var modalWindow = $('.' + formClassName),
      viewportWidth = $(window).width();

  if (modalWindow.hasClass('fade')) {
    modalWindow.removeClass('hidden');
    $('.main').addClass('blur');
    $('.form-container').addClass('blur');
    modalWindow.removeClass('blur');

    setTimeout(function() {
      modalWindow.removeClass('fade');
    }, 10);
  } else {
    modalWindow.addClass('fade');
    $('.form-container').removeClass('blur');

    setTimeout(function() {
      modalWindow.addClass('hidden');
      modalWindow.addClass('fade');
      $('.form-container').removeClass('blur');
      if ($('.form-container').length === $('.form-container').not(":visible").length) $('.main').removeClass('blur');
    }, timeout);
  }
}

// simple page router
helperProto.prototype.openPage = function(url) {
  $('body').removeClass('modal-open');
  clearInterval(dashboardUpdateTimer);

  if (helperProto.prototype.checkSession(true) && url !== 'dashboard' && url !== 'settings') {
    url = document.location.hash.replace('#', '');
  }

  switch (url) {
    case 'login':
      iguanaNullReturnCount = 0;
      document.location.hash = '#login';
      document.title = 'Iguana / Login';
      $('body').html(loginFormPrepTemplate());
      $('body').removeClass('dashboard-page');
      initAuthCB();
      break;
    case 'create-account':
      document.location.hash = '#create-account';
      document.title = 'Iguana / Create account';
      $('body').html(signupFormPrepTemplate());
      $('body').removeClass('dashboard-page');
      initAuthCB();
      break;
    case 'dashboard':
      document.location.hash = '#dashboard';
      document.title = 'Iguana / Dashboard';
      defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;
      var temp = dashboardTemplate.replace(/{{ currency }}/g, defaultCurrency);
      $('body').addClass('dashboard-page');
      $('body').html(temp);
      initDashboard();
      break;
    case 'settings':
      document.location.hash = '#settings';
      document.title = 'Iguana / Settings';
      $('body').addClass('dashboard-page');
      $('body').html(referenceCurrencyTemplate);
      initReferenceCurrency();
      break;
  }
  helperProto.prototype.checkIfIguanaOrCoindIsPresent();
}

helperProto.prototype.checkSession = function(returnVal) {
  if (!localstorage.getVal('iguana-auth')) {
    helperProto.prototype.logout();
  } else {
    var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
        secondsElapsedSinceLastAuth = Number(currentEpochTime) - Number(localstorage.getVal('iguana-auth').timestamp / 1000);

    if (secondsElapsedSinceLastAuth > (isIguana ? settings.defaultSessionLifetimeIguana : settings.defaultSessionLifetimeCoind)) {
      if (!returnVal) {
        if (!$('.login-form').width()) helperProto.prototype.openPage('login'); // redirect to login when session is expired
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}

helperProto.prototype.ratesUpdateElapsedTime = function(coin) {
  if (localstorage.getVal('iguana-rates-' + coin.toLowerCase())) {
    var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(localstorage.getVal('iguana-rates-' + coin.toLowerCase()).updatedAt / 1000);

    return secondsElapsed;
  } else {
    return false;
  }
}

// in seconds
helperProto.prototype.getTimeDiffBetweenNowAndDate = function(from) {
  var currentEpochTime = new Date(Date.now()) / 1000,
      secondsElapsed = Number(currentEpochTime) - Number(from / 1000);

  return secondsElapsed;
}

helperProto.prototype.logout = function(noRedirect) {
  if (isIguana) {
    apiProto.prototype.walletLock();
    localstorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
    helperProto.prototype.openPage('login');
  } else {
    coindWalletLockCount = 0;

    for (var key in coinsInfo) {
      if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
        coindWalletLockCount++;
      }
    }

    // in case something went bad
    if (coindWalletLockCount === 0) {
      localstorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
      helperProto.prototype.openPage('login');
    }

    helperProto.prototype.logoutCoind();
  }
}

helperProto.prototype.logoutCoind = function() {
  for (var key in coinsInfo) {
    if (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
      apiProto.prototype.walletLock(key, helperProto.prototype.logoutCoindCB(key));
    }
  }
}

helperProto.prototype.logoutCoindCB = function(key) {
  coindWalletLockResults[key] = true;
  localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });

  if (Object.keys(coindWalletLockResults).length === coindWalletLockCount) {
    localstorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
    helperProto.prototype.openPage('login');
  }
}

helperProto.prototype.setCurrency = function(currencyShortName) {
  localstorage.setVal('iguana-currency', { 'name' : currencyShortName });

  for (var key in coinsInfo) {
    localstorage.setVal('iguana-rates-' + key, { 'shortName' : null, 'value': null, 'updatedAt': 1471620867, 'forceUpdate': true }); // force currency update
  }
}

helperProto.prototype.getCurrency = function() {
  return localstorage.getVal('iguana-currency');
}

helperProto.prototype.getCurrentPage = function() {
  return document.location.hash.replace('#', '');
}

helperProto.prototype.syncStatus = function() {
  $(document).ready(function() {
    if (dev.isDev && dev.showSyncDebug) {
      $('body').append('<div id=\"debug-sync-info\" style=\"position:fixed;background:#fff;bottom:0;width:100%;border-top:solid 1px #000;left:0;font-weight:bold;padding:10px 0;text-align:center\">sync info</div>');
      $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
    }

    setInterval(function() {
      //console.clear();
      apiProto.prototype.testConnection();
    }, portPollUpdateTimeout * 1000);
  });
}

/* store port poll data */
helperProto.prototype.setPortPollResponse = function() {
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
helperProto.prototype.getPortPollResponse = function() {
  if (setPortPollResponseDS) {
    for (var i=0; i < setPortPollResponseDS.info.length; i++) {
      coinsInfo[setPortPollResponseDS.info[i].coin] = [];
      coinsInfo[setPortPollResponseDS.info[i].coin].RT = setPortPollResponseDS.info[i].RT;
      coinsInfo[setPortPollResponseDS.info[i].coin].connection = setPortPollResponseDS.info[i].connection;
      isIguana = setPortPollResponseDS.isIguana;
    }

    if (dev.isDev && dev.showSyncDebug) { // debug info
      if (setPortPollResponseDS.debugHTML) $('#debug-sync-info').html(JSON.parse(setPortPollResponseDS.debugHTML));
      $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
      setInterval(function() {
        if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
        $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
      }, 1000);
    }
  }
}

helperProto.prototype.addCopyToClipboardFromElement = function(elementId, elementDisplayName) {
  $(elementId).off();
  $(elementId).click(function() {
    if (!isExecCopyFailed)
      try {
        $(elementId + '-hidden').select();
        document.execCommand('copy');
        helperProto.prototype.prepMessageModal(elementDisplayName + ' copied to clipboard: ' + $(elementId + '-hidden').val(), 'blue', true);
        pasteTextFromClipboard = $(elementId + '-hidden').val();
      } catch(e) {
        isExecCopyFailed = true;
        helperProto.prototype.prepMessageModal('Copy/paste is not supported in your browser! Please select the passphrase manually.', 'red', true);
      }
  });
}

// format a number
helperProto.prototype.decimalPlacesFormat = function(value) {
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

helperProto.prototype.initMessageModal = function() {
  $('body').append(messageModalTemplate);

  $('#messageModal').off();
  $('#messageModal').click(function() {
    $('#messageModal').removeClass('in');
    setTimeout(function() {
      $('#messageModal').hide();
    }, 250);

    // message modal on close blur fix
    // ugly
    if ($('.modal:visible').length) {
      setTimeout(function() {
        $('body').addClass('modal-open');
      }, 400);
    } else {
      $('body').removeClass('modal-open');
    }
  });
}

helperProto.prototype.prepMessageModal = function(message, color, fireModal) {
  $('#messageModal').removeClass('msg-red').removeClass('msg-blue').removeClass('msg-green');
  $('#messageModal').addClass('msg-' + color);
  $('#messageModal .msg-body').html(message);

  if (fireModal) {
    $('#messageModal').show();
    setTimeout(function() {
      $('#messageModal').addClass('in');
    }, 100);
  }
}

helperProto.prototype.prepNoDaemonModal = function() {
  $('#messageModal').off();
  helperProto.prototype.prepMessageModal('No required daemon is running. Make sure it\'s on and these <a href=\"#\" onclick="helperProto.prototype.prepRequirementsModal()">requirements are satisfied.</a>', 'red', true);
}

helperProto.prototype.prepRequirementsModal = function() {
  helperProto.prototype.prepMessageModal('Minimum daemon configuration to comminicate via http requests and a proxy server.', 'blue', true);

  // "No required daemon is running" message always stays active on top of any ui
  //  this ensures that users won't interact with any elements until connectivity problems are resolved

  /*setTimeout(function() {
    $('#messageModal').off();
    $('#messageModal').click(function() {
      $('#messageModal').removeClass('in');
      setTimeout(function() {
        $('#messageModal').hide();
      }, 250);
    });
  }, 200);*/
}

helperProto.prototype.checkIfIguanaOrCoindIsPresent = function() {
  $(document).ready(function() {
    var numPortsResponding = 0;

    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true && coinsInfo[key].coin !== 'undefined') numPortsResponding++;
    }

    if (setPortPollResponseDS && (!isIguana && !numPortsResponding) ||
        (setPortPollResponseDS.isIguana === false && setPortPollResponseDS.proxy === true && !numPortsResponding) ||
        (setPortPollResponseDS.isIguana === false && setPortPollResponseDS.proxy === false)) {
      helperProto.prototype.prepNoDaemonModal();

      // logout
      setTimeout(function() {
        if (helperProto.prototype.getCurrentPage() === 'dashboard' || helperProto.prototype.getCurrentPage() === 'settings') helperProto.prototype.logout();
      }, 15000);
    } else {
      $('#messageModal').removeClass('in');
      setTimeout(function() {
        $('#messageModal').hide();
      }, 250);
    }
  });
}

helperProto.prototype.getCursorPositionInputElement = function(element) {
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

helperProto.prototype.syncStatus();

var helper = new helperProto();