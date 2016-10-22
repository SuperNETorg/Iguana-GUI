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
      if (viewportWidth < 920) {
        $('.modal', modalWindow).addClass('modal-full-width');
      }
      $(window).resize(function () {
        viewportWidth = $(window).width();
        if (viewportWidth < 920) {
          $('.modal', modalWindow).addClass('modal-full-width');
        } else {
          $('.modal', modalWindow).removeClass('modal-full-width');
        }
      })
    }, 10);
  } else {
    modalWindow.addClass('fade');
    $('.form-container').removeClass('blur');

    setTimeout(function() {
      modalWindow.addClass('hidden');
      modalWindow.addClass('fade');
      $('.form-container').removeClass('blur');
      if ($('.form-container').length === $('.form-container').not(":visible").length) $('.main').removeClass('blur');
      $('.modal', modalWindow).removeClass('modal-full-width');
    }, timeout);
  }
}

// simple page router
helperProto.prototype.openPage = function(url) {
  $('body').removeClass('modal-open');
  clearInterval(dashboardUpdateTimer);
  switch (url) {
    case 'login':
      document.location.hash = '#login';
      document.title = 'Iguana / Login';
      $('body').html(loginTemplate);
      initAuthCB();
      break;
    case 'create-account':
      document.location.hash = '#create-account';
      document.title = 'Iguana / Create account';
      $('body').html(signupTemplate);
      initAuthCB();
      break;
    case 'dashboard':
      document.location.hash = '#dashboard';
      document.title = 'Iguana / Dashboard';
      $('body').html(dashboardTemplate);
      initDashboard();
      break;
    case 'settings':
      document.location.hash = '#settings';
      document.title = 'Iguana / Settings';
      $('body').html(referenceCurrencyTemplate);
      initReferenceCurrency();
      break;
  }
  helperProto.prototype.checkIfIguanaOrCoindIsPresent();
}

helperProto.prototype.checkSession = function(returnVal) {
  var localStorage = new localStorageProto();

  if (!localStorage.getVal('iguana-auth')) {
    helperProto.prototype.logout();
  } else {
    var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
        secondsElapsedSinceLastAuth = Number(currentEpochTime) - Number(localStorage.getVal('iguana-auth').timestamp / 1000);

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
  var localStorage = new localStorageProto();

  if (localStorage.getVal('iguana-rates-' + coin.toLowerCase())) {
    var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(localStorage.getVal('iguana-rates-' + coin.toLowerCase()).updatedAt / 1000);

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
  var localStorage = new localStorageProto();

  if (isIguana) {
    apiProto.prototype.walletLock();
    localStorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
    helperProto.prototype.openPage('login');
  } else {
    coindWalletLockCount = 0;

    for (var key in coinsInfo) {
      if (localStorage.getVal('iguana-' + key + '-passphrase') && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
        coindWalletLockCount++;
      }
    }

    // in case something went bad
    if (coindWalletLockCount === 0) {
      localStorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
      helperProto.prototype.openPage('login');
    }

    helperProto.prototype.logoutCoind();
  }
}

helperProto.prototype.logoutCoind = function() {
  var localStorage = new localStorageProto(),
      api = new apiProto();

  for (var key in coinsInfo) {
    if (localStorage.getVal('iguana-' + key + '-passphrase') && localStorage.getVal('iguana-' + key + '-passphrase').logged === 'yes') {
      api.walletLock(key, helperProto.prototype.logoutCoindCB(key));
    }
  }
}

helperProto.prototype.logoutCoindCB = function(key) {
  var localStorage = new localStorageProto();

  coindWalletLockResults[key] = true;
  localStorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });

  if (Object.keys(coindWalletLockResults).length === coindWalletLockCount) {
    localStorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
    helperProto.prototype.openPage('login');
  }
}

helperProto.prototype.setCurrency = function(currencyShortName) {
  var localStorage = new localStorageProto();

  localStorage.setVal('iguana-currency', { 'name' : currencyShortName });

  for (var key in coinsInfo) {
    localStorage.setVal('iguana-rates-' + key, { 'shortName' : null, 'value': null, 'updatedAt': 1471620867, 'forceUpdate': true }); // force currency update
  }
}

helperProto.prototype.getCurrency = function() {
  var localStorage = new localStorageProto();

  return localStorage.getVal('iguana-currency');
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
    if (key.length > 0)
      coinsInfoJSON.push({ coin: key,
                           connection: coinsInfo[key].connection || false,
                           RT: coinsInfo[key].RT || false,
                           relayFee: coinsInfo[key].relayFee || 0 });
  }

  localStorageProto.prototype.setVal('iguana-port-poll', { 'updatedAt': Date.now(),
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
      if (coinsInfo[key].connection === true) numPortsResponding++;
    }

    if (!isIguana && !numPortsResponding) {
      helperProto.prototype.prepNoDaemonModal();
    }
  });
}

helperProto.prototype.syncStatus();