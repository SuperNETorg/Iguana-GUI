/*!
 * Iguana authorization, coind
 *
 */

var addCoinResponses = [],
    selectedCoins = 0,
    coinsSelectedToAdd,
    buttonClassNameCB = '';

function authAllAvailableCoind(modalClassName) {
  var result = false;

  coindAuthResults = [];

  if (!coinsSelectedToAdd)
    helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
  else
    api.walletLock(coinsSelectedToAdd[0], api.walletLogin($((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val(), defaultSessionLifetime, coinsSelectedToAdd[0], authAllAvailableCoindCB));

  return result;
}

function authAllAvailableCoindCB(result, key) {
  coindAuthResults[key] = result;

  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'yes' });
  if (coindAuthResults[key] === -14) {
    if (coinsSelectedToAdd.length === 1 && helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'dashboard') helper.prepMessageModal(helper.lang('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
    result = false;
  }
  if (coindAuthResults[key] === -15 && helper.getCurrentPage() !== 'create-account') {
    if (coinsSelectedToAdd.length === 1) helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'), 'red', true);
    result = false;
  }

  // check coind login results
  var seletedLoginCoind = $('.non-iguana-coins-repeater').find('input:checked');
  // all coind walletpassphrase responses are arrived by now
  if (coinsSelectedToAdd.length === 1 || Object.keys(coindAuthResults).length === seletedLoginCoind.length) {
    var isAnyCoindLoginError = false;

    for (var key in coindAuthResults) {
      if (coindAuthResults[key] === -14 || coindAuthResults[key] === -15) isAnyCoindLoginError = true;
    }

    if (!isAnyCoindLoginError && helper.getCurrentPage() !== 'dashboard') {
      localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
      helper.openPage('dashboard');
    } else {
      if (!isAnyCoindLoginError) {
        helper.toggleModalWindow('add-coin-login-form', 300);
        $('body').removeClass('modal-open');
        if (helper.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
      }
    }
  }
}

function encryptCoindWallet(modalClassName) {
  var passphraseInput = $((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val(),
      result = false;

  if (coinsSelectedToAdd[0]) selectedCoindToEncrypt = coinsSelectedToAdd[0];

  if (verifyNewPassphrase(modalClassName)) {
    var walletEncryptResponse = api.walletEncrypt(passphraseInput, selectedCoindToEncrypt);

    if (walletEncryptResponse !== -15) {
      result = true;
      $('.non-iguana-walletpassphrase-errors').html('');
      helper.prepMessageModal(selectedCoindToEncrypt + helper.lang('MESSAGE.X_WALLET_IS_CREATED'), 'green', true);
      if (helper.getCurrentPage() === 'dashboard') {
        helper.toggleModalWindow('add-coin-create-wallet-form', 300);
      } else {
        helper.openPage('login');
      }
    } else {
      helper.prepMessageModal(helper.lang('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'), 'red', true);
      if (helper.getCurrentPage() === 'dashboard') {
        helper.toggleModalWindow('add-coin-create-wallet-form', 300);
      }
      //$('.login-input-directions-error.center.offset-bottom-sm.col-red.unselectable').html('Wallet is already encrypted with another passphrase!');
      //$('.non-iguana-walletpassphrase-errors').html('<div class=\"center\">Wallet is already encrypted with another passphrase!</div>');
      result = false;
    }
  } else {
    helper.prepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'), 'red', true);
    result = false;
  }

  return result;
}

function checkSelectedWallet(key) {
  var isCoindChecked = false;

  if (coinsSelectedToAdd && coinsSelectedToAdd[0]) {
    selectedCoindToEncrypt = key = coinsSelectedToAdd[0];
    return true;
  } else {
    helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
  }

  if (key) {
    selectedCoindToEncrypt = key;
  } else {
    return isCoindChecked;
  }
}

function checkIguanaCoinsSelection(suppressAddCoin) {
  var result = false;

  coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

  selectedCoins = 0;

  if (!suppressAddCoin) {
    buttonClassNameCB = 'signin';
    addCoinResponses = [];

    for (var key in coinsInfo) {
      localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });
    }

    for (var i=0; i < coinsSelectedToAdd.length; i++) {
      if (coinsSelectedToAdd[i]) {
        selectedCoins++;

        (function(x) {
          setTimeout(function() {
            api.addCoin(coinsSelectedToAdd[x], addCoinCB);
          }, x === 0 ? 0 : settings.addCoinTimeout * 1000);
        })(i);
      }

      if (selectedCoins > 0) result = true;
    }
  } else {
    buttonClassNameCB = 'add-account';
    result = true;
  }

  return result;
}

function addCoinCB(response, coin) {
  if (response === 'coin added' || response === 'coin already there') {
    if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coin + ' coin added<br/>');

    addCoinResponses.push({ 'coin': coin, 'response': response });
    coinsInfo[coin].connection = true; // update coins info obj prior to scheduled port poll
  }

  var addedCoinsOutput = '',
      failedCoinsOutput = '<br/>';
  for (var i=0; i < Object.keys(addCoinResponses).length; i++) {
    if (addCoinResponses[i].response === 'coin added' || addCoinResponses[i].response === 'coin already there') {
      addedCoinsOutput = addedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
      localstorage.setVal('iguana-' + addCoinResponses[i].coin + '-passphrase', { 'logged': 'yes' });
    } else {
      failedCoinsOutput = failedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
    }
  }
  if (addedCoinsOutput[addedCoinsOutput.length - 1] === ' ') {
    addedCoinsOutput = addedCoinsOutput.replace(/, $/, '');
  }
  if (failedCoinsOutput[failedCoinsOutput.length - 1] === ' ') {
    failedCoinsOutput = failedCoinsOutput.replace(/, $/, '');
  }

  helper.prepMessageModal(addedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P1') + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P2') : '') + (Object.keys(addCoinResponses).length === selectedCoins ? '<br/>' + helper.lang('MESSAGE.REDIRECTING_TO_DASHBOARD') + '...' : ''), 'green', true);

  if (Object.keys(addCoinResponses).length === selectedCoins) {
    // since there's no error on nonexistent wallet passphrase in Iguana
    // redirect to dashboard with 5s timeout
    // TODO(?): point out if a coin is already running
    setTimeout(function() {
      addAccountIguanaCoind(buttonClassNameCB);
    }, settings.addCoinInfoModalTimeout * 1000);
  }
}