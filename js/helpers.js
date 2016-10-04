/*!
 * Iguana helpers
 * info: various reusable functions go here
 * TODO: add settings obj
 */

var helperProto = function() {};

var defaultSessionLifetime = settings.defaultSessionLifetime,
    portPollUpdateTimeout = settings.portPollUpdateTimeout,
    pasteTextFromClipboard = false,
    isExecCopyFailed = false;

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

helperProto.prototype.toggleModalWindow = function(formClassName, timeout) {
  var modalWindow = $('.' + formClassName);

  if (modalWindow.hasClass('fade')) {
    modalWindow.removeClass('hidden');

    setTimeout(function() {
      modalWindow.removeClass('fade');
    }, 10);
  } else {
    modalWindow.addClass('fade');

    setTimeout(function() {
      modalWindow.addClass('hidden');
    }, timeout);
  }
}

// simple page router
helperProto.prototype.openPage = function(url) {
  var localPageUrl;

  switch (url) {
    case 'login':
      localPageUrl = 'index.html';
      break;
    case 'create-account':
      localPageUrl = 'create-account.html';
      break;
    case 'dashboard':
      localPageUrl = 'dashboard.html';
      break;
    case 'settings':
      localPageUrl = 'reference-currency.html';
      break;
  }

  document.location = localPageUrl;
}

helperProto.prototype.checkSession = function(returnVal) {
  var localStorage = new localStorageProto();

  if (!localStorage.getVal('iguana-auth')) {
    helperProto.prototype.logout();
  } else {
    var currentEpochTime = new Date(Date.now()) / 1000, // calc difference in seconds between current time and session timestamp
        secondsElapsedSinceLastAuth = Number(currentEpochTime) - Number(localStorage.getVal('iguana-auth').timestamp / 1000);

    if (secondsElapsedSinceLastAuth > defaultSessionLifetime) {
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

  if (localStorage.getVal('iguana-rates-' + coin)) {
    var currentEpochTime = new Date(Date.now()) / 1000,
        secondsElapsed = Number(currentEpochTime) - Number(localStorage.getVal('iguana-rates-' + coin).updatedAt / 1000);

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

  apiProto.prototype.walletLock();
  localStorage.setVal('iguana-auth', { 'timestamp' : 1471620867 }); // Jan 01 1970
  helperProto.prototype.openPage('login');
}

helperProto.prototype.setCurrency = function(currencyShortName) {
  var localStorage = new localStorageProto();

  localStorage.setVal('iguana-currency', { 'name' : currencyShortName });
  localStorage.setVal('iguana-rates', { 'shortName' : null, 'value': null, 'updatedAt': 1471620867 }); // force currency update
}

helperProto.prototype.getCurrency = function() {
  var localStorage = new localStorageProto();

  return localStorage.getVal('iguana-currency');
}

helperProto.prototype.getCurrentPage = function() {
  var currentPageComponents = window.location.href.split('/'),
      currentPage = currentPageComponents[currentPageComponents.length - 1].split('.html');

  return currentPage[0];
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
                           RT: coinsInfo[key].RT || false });
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
  // TODO: add iguana/non-iguana check
  //       no active coin/p2p coind -> force port poll update
  /*console.log(setPortPollResponseDS);
  for (var i=0; i < setPortPollResponseDS.info.length; i++) {
  }*/

  if (setPortPollResponseDS) {
    for (var i=0; i < setPortPollResponseDS.info.length; i++) {
      coinsInfo[setPortPollResponseDS.info[i].coin] = [];
      coinsInfo[setPortPollResponseDS.info[i].coin].RT = setPortPollResponseDS.info[i].RT;
      coinsInfo[setPortPollResponseDS.info[i].coin].connection = setPortPollResponseDS.info[i].connection;
      isIguana = setPortPollResponseDS.isIguana;
    }

    if (dev.isDev && dev.showSyncDebug) {
      $('#debug-sync-info').html(JSON.parse(setPortPollResponseDS.debugHTML));
      $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
      setInterval(function() {
        if ($('.transactions-unit')) $('.transactions-unit').css({ 'margin-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
        $('body').css({ 'padding-bottom': $('#debug-sync-info').outerHeight() * 1.5 });
      }, 1000);
    }
  }
}

// TODO: add browser update message if copy/paste is not supported
helperProto.prototype.addCopyToClipboardFromElement = function(elementId, elementDisplayName) {
  $(elementId).click(function() {
    if (!isExecCopyFailed)
      try {
        $(elementId + '-hidden').select();
        document.execCommand('copy');
        alert(elementDisplayName + ' copied to clipboard: ' + $(elementId + '-hidden').val());
        pasteTextFromClipboard = $(elementId + '-hidden').val();
      } catch(e) {
        isExecCopyFailed = true;
        alert('Copy/paste is not supported in your browser! Please select the passphrase manually.');
      }
  });
}

helperProto.prototype.syncStatus();