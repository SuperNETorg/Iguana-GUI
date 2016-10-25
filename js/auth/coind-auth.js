/*!
 * Iguana authorization, coind
 *
 */

var addCoinResponses = [],
    selectedCoins = 0,
    coinsSelectedToAdd,
    buttonClassNameCB = '';

function authAllAvailableCoind(modalClassName) {
  var api = new apiProto(),
      helper = new helperProto(),
      result = false;

  coindAuthResults = [];

  if (!coinsSelectedToAdd) helper.prepMessageModal('Please select a wallet', 'blue', true);
  else
    api.walletLock(coinsSelectedToAdd[0], api.walletLogin($((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val(), defaultSessionLifetime, coinsSelectedToAdd[0], authAllAvailableCoindCB));

  // multi-wallet login
  // don't remove
  /*$('.non-iguana-coins-repeater-error').html('');

  var checkedCoindCount = 0;
  for (var key in coinsInfo) {
    if ($('#iguana-coin-' + key + '-checkbox').prop('checked')) checkedCoindCount++;
  }

  if (checkedCoindCount === 0)
    $('.non-iguana-coins-repeater-error').html('<div class=\"center offset-bottom-sm\">Please select at least one coin</div>');
  else
    for (var key in coinsInfo) {
      if (coinsInfo[key].connection === true && $('#iguana-coin-' + key + '-checkbox').prop('checked')) {
        api.walletLock(key, api.walletLogin($('#iguana-coin-' + key + '-textarea').val(), defaultSessionLifetime, key, authAllAvailableCoindCB));
      }
    };*/

  return result;
}

function authAllAvailableCoindCB(result, key) {
  var helper = new helperProto();

  coindAuthResults[key] = result;
  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'yes' });
  if (coindAuthResults[key] === -14) {
    if (coinsSelectedToAdd.length === 1 && helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'dashboard') helper.prepMessageModal('Wrong passphrase!', 'red', true);
    $('.iguana-coin-' + key + '-error').html('<strong style=\"color:red;float:right\">wrong passphrase!</strong>');
    result = false;
  }
  if (coindAuthResults[key] === -15 && helper.getCurrentPage() !== 'create-account') {
    if (coinsSelectedToAdd.length === 1) helper.prepMessageModal('Please encrypt your wallet with a passphrase!', 'red', true);
    $('.iguana-coin-' + key + '-error').html('<strong style=\"color:red;float:right\">please encrypt your wallet with a passphrase!</strong>');
    result = false;
  }
  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) {
    $('.iguana-coin-' + key + '-error').html('');
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
      var helper = new helperProto();

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
  var api = new apiProto(),
      helper = new helperProto(),
      passphraseInput = $((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val(),
      result = false;

  if (coinsSelectedToAdd[0]) selectedCoindToEncrypt = coinsSelectedToAdd[0];

  if (verifyNewPassphrase(modalClassName)) {
    var walletEncryptResponse = api.walletEncrypt(passphraseInput, selectedCoindToEncrypt);

    if (walletEncryptResponse !== -15) {
      result = true;
      $('.non-iguana-walletpassphrase-errors').html('');
      helper.prepMessageModal(selectedCoindToEncrypt + ' wallet is created. Login to access it.', 'green', true);
      if (helper.getCurrentPage() === 'dashboard') {
        helper.toggleModalWindow('add-coin-create-wallet-form', 300);
      } else {
        helper.openPage('login');
      }
    } else {
      helper.prepMessageModal('Wallet is already encrypted with another passphrase!', 'red', true);
      if (helper.getCurrentPage() === 'dashboard') {
        helper.toggleModalWindow('add-coin-create-wallet-form', 300);
      }
      //$('.login-input-directions-error.center.offset-bottom-sm.col-red.unselectable').html('Wallet is already encrypted with another passphrase!');
      //$('.non-iguana-walletpassphrase-errors').html('<div class=\"center\">Wallet is already encrypted with another passphrase!</div>');
      result = false;
    }
  } else {
    helper.prepMessageModal('Passphrases are not matching. Please repeat previous step one more time.', 'red', true);
    result = false;
  }

  return result;
}

function checkSelectedWallet(key) {
  var isCoindChecked = false,
      helper = new helperProto();

  if (coinsSelectedToAdd && coinsSelectedToAdd[0]) {
    selectedCoindToEncrypt = key = coinsSelectedToAdd[0];
    return true;
  } else {
    helper.prepMessageModal('Please select a wallet!', 'blue', true);
  }

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
      api = new apiProto(),
      helper = new helperProto();

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
        var addCoinResult = api.addCoin(coinsSelectedToAdd[i], addCoinCB);
        selectedCoins++;
      }

      if (selectedCoins > 0) result = true;
    }
  } else {
    buttonClassNameCB = 'add-account';
    result = true;
  }

  if (suppressAddCoin) constructAuthCoinsRepeater();

  return result;
}

function addCoinCB(response, coin) {
  var helper = new helperProto();

  if (response === 'coin added' || response === 'coin already there') {
    if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coin + ' coin added<br/>');

    addCoinResponses.push({ 'coin': coin, 'response': response });
    coinsInfo[coin].connection = true; // update coins info obj prior to scheduled port poll
  }

  if (Object.keys(addCoinResponses).length === selectedCoins) {
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

    // since there's no error on nonexistent wallet passphrase in Iguana
    // redirect to dashboard with 5s timeout
    // TODO(?): point out if a coin is already running
    helper.prepMessageModal(addedCoinsOutput + ' added.' + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' failed to add.' : '') + '<br/>Redirecting to dashboard...', 'green', true);
    setTimeout(function() {
      addAccountIguanaCoind(buttonClassNameCB);
    }, settings.addCoinInfoModalTimeout);
  }
}