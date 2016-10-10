/*!
 * Iguana authorization, coind
 *
 */

var addCoinResponses = [],
    selectedCoins = 0,
    buttonClassNameCB = '';

function authAllAvailableCoind() {
  var api = new apiProto(),
      helper = new helperProto(),
      result = false;

  coindAuthResults = [];

  api.walletLock(coinsSelectedToAdd[0], api.walletLogin($('#passphrase').val(), defaultSessionLifetime, coinsSelectedToAdd[0], authAllAvailableCoindCB));

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
  var localStorage = new localStorageProto(),
      helper = new helperProto();

  coindAuthResults[key] = result;
  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) localStorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'yes' });
  if (coindAuthResults[key] === -14) {
    if (coinsSelectedToAdd.length === 1 && helper.getCurrentPage() === 'index') alert('Wrong passphrase!');
    $('.iguana-coin-' + key + '-error').html('<strong style=\"color:red;float:right\">wrong passphrase!</strong>');
    result = false;
  }
  if (coindAuthResults[key] === -15) {
    if (coinsSelectedToAdd.length === 1) alert('Please encrypt your wallet with a passphrase!');
    $('.iguana-coin-' + key + '-error').html('<strong style=\"color:red;float:right\">please encrypt your wallet with a passphrase!</strong>');
    result = false;
  }
  if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) {
    $('.iguana-coin-' + key + '-error').html('');
  }

  // check coind login results
  var seletedLoginCoind = $('.non-iguana-coins-repeater').find('input:checked');
  // all coind walletpassphrase responses are arived by now
  if (coinsSelectedToAdd.length === 1 || Object.keys(coindAuthResults).length === seletedLoginCoind.length) {
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

  if (coinsSelectedToAdd[0]) selectedCoindToEncrypt = coinsSelectedToAdd[0];

  if (verifyNewPassphrase()) {
    var walletEncryptResponse = api.walletEncrypt(passphraseInput, selectedCoindToEncrypt);

    if (walletEncryptResponse !== -15) {
      result = true;
      $('.non-iguana-walletpassphrase-errors').html('');
      alert('Wallet is encrypted. Please restart ' + selectedCoindToEncrypt + '.');
      helper.openPage('login');
    } else {
      $('.login-input-directions-error.center.offset-bottom-sm.col-red.unselectable').html('Wallet is already encrypted with another passphrase!');
      //$('.non-iguana-walletpassphrase-errors').html('<div class=\"center\">Wallet is already encrypted with another passphrase!</div>');
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
  if (coinsSelectedToAdd[0]) {
    selectedCoindToEncrypt = key = coinsSelectedToAdd[0];
    return true;
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
      localStorage = new localStorageProto();

  selectedCoins = 0;

  if (!suppressAddCoin) {
    buttonClassNameCB = 'signin';
    addCoinResponses = [];

    for (var key in coinsInfo) {
      localStorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });

      if ($('#iguana-coin-' + key + '-checkbox').prop('checked')) {
        selectedCoins++;
        api.addCoin(key, addCoinCB);
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
  var localStorage = new localStorageProto();

  if (response === 'coin added' || response === 'coin already there') {
    if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coin + ' coin added<br/>');

    addCoinResponses.push({ 'coin': coin, 'response': response });
    localStorage.setVal('iguana-' + coin + '-passphrase', { 'logged': 'yes' });
    coinsInfo[coin].connection = true;
  }

  if (Object.keys(addCoinResponses).length === selectedCoins) {
    addAccountIguanaCoind(buttonClassNameCB);
  }
}