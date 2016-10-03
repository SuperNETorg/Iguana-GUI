/*!
 * Iguana authorization, coind
 *
 */

function authAllAvailableCoind() {
  var api = new apiProto(),
      result = false;

  coindAuthResults = [];
  $('.non-iguana-coins-repeater-error').html('');

  var checkedCoindCount = 0;
  for (var key in coinsInfo) {
    if ($('#iguana-coin-' + key + '-checkbox').prop('checked')) checkedCoindCount++;
  }
  if (checkedCoindCount === 0) $('.non-iguana-coins-repeater-error').html('<div class=\"center offset-bottom-sm\">Please select at least one coin</div>');
  else
    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true && $('#iguana-coin-' + key + '-checkbox').prop('checked')) {
        api.walletLock(key, api.walletLogin($('#iguana-coin-' + key + '-textarea').val(), defaultSessionLifetime, key, authAllAvailableCoindCB));
      }
    };

  return result;
}

function authAllAvailableCoindCB(result, key, isLast) {
  var localStorage = new localStorageProto();

  coindAuthResults[key] = result;
  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) localStorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'yes' });
  if (coindAuthResults[key] === -14) {
    $('.iguana-coin-' + key + '-error').html('<strong style=\"color:red;float:right\">wrong passphrase!</strong>');
    result = false;
  }
  if (coindAuthResults[key] === -15) {
    $('.iguana-coin-' + key + '-error').html('<strong style=\"color:red;float:right\">please encrypt your wallet with a passphrase!</strong>');
    result = false;
  }
  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) {
    $('.iguana-coin-' + key + '-error').html('');
  }

  // check coind login results
  var seletedLoginCoind = $('.non-iguana-coins-repeater').find('input:checked');
  // all coind walletpassphrase responses are arived by now
  if (Object.keys(coindAuthResults).length === seletedLoginCoind.length) {
    var isAnyCoindLoginError = false;

    for (var key in coindAuthResults) {
      if (coindAuthResults[key] === -14 || coindAuthResults[key] === -15) isAnyCoindLoginError = true;
    }

    if (!isAnyCoindLoginError) {
      var helper = new helperProto();

      localStorage.setVal('iguana-auth', { 'timestamp': Date.now() });
      helper.openPage('dashboard');
    }
  }
}

function encryptCoindWallet() {
  var api = new apiProto(),
      helper = new helperProto(),
      passphraseInput = $('#passphrase').val(),
      result = false;

  if (verifyNewPassphrase()) {
    var walletEncryptResponse = api.walletEncrypt(passphraseInput, selectedCoindToEncrypt);

    if (walletEncryptResponse !== -15) {
      result = true;
      $('.non-iguana-walletpassphrase-errors').html('');
      alert('Wallet is encrypted. Please restart ' + selectedCoindToEncrypt + '.');
      helper.openPage('login');
    } else {
      $('.non-iguana-walletpassphrase-errors').html('<div class=\"center\">Wallet is already encrypted with another passphrase!</div>');
      result = false;
    }
  } else {
    $('.non-iguana-walletpassphrase-errors').html('<div class=\"center\">Passphrases are not matching. Please repeat previous step one more time.</div>');
    result = false;
  }

  return result;
}

function checkSelectedWallet(key) {
  var isCoindChecked = false;

  for (var _key in coinsInfo) {
    if ($('#iguana-coin-' + _key + '-checkbox').prop('checked')) isCoindChecked = true;
    $('#iguana-coin-' + _key + '-checkbox').prop('checked', false);
  }

  if (key) {
    selectedCoindToEncrypt = key;
    $('#iguana-coin-' + key + '-checkbox').addClass("checked");
  } else {
    return isCoindChecked;
  }
}

function checkIguanaCoinsSelection(suppressAddCoin) {
  var result = false,
      api = new apiProto();

  if (!suppressAddCoin)
    for (var key in coinsInfo) {
      if ($('#iguana-coin-' + key + '-checkbox').prop('checked')) {
        if (api.addCoin(key)) {
          if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(key + ' coin added<br/>');
          coinsInfo[key].connection = true;
          result = true;
        }
      }

      if (isIguana && coinsInfo[key].connection === true || result === true) result = true;
    }
  else
    result = true;

  constructAuthCoinsRepeater();

  return result;
}