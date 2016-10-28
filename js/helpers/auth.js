/*!
 * Iguana helpers/auth
 *
 */

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