/*!
 * Iguana authorization
 *
 */

 // TODO: refactor repeater update
 //       fix coind encryptwallet

var passphraseToVerify,
    coindAuthResults = [];

$(document).ready(function() {
  var api = new apiProto();

  api.testConnection(initAuthCB);
});

function initAuthCB() {
  var localStorage = new localStorageProto(),
      helper = new helperProto(),
      selectedCoindToEncrypt;

  // ugly login form check
  if ($('.login-form')) {
    $('#passphrase').val(isDev && isIguana ? coinPW.iguana : '');

    if (isDev) $('.btn-signin').removeClass('disabled');

    if (helper.checkSession(true)) {
      helper.openPage('dashboard');
    } else {
      $('.login-form').removeClass('hidden');
    }
    $('.login-form .btn-signup').click(function() {
      helper.openPage('create-account');
    });

    constructAuthCoinsRepeater();
    addAuthorizationButtonAction('signin');
    watchPassphraseKeyUpEvent('signin');
  }

  if ($('.create-account-form').width()) {
    $.getScript("js/libs/zeroclipboard.min.js", function() {
      if (showConsoleMessages && isDev) console.log('script js/libs/zeroclipboard.min.js loaded and executed');
    });
    addAuthorizationButtonAction('add-account');
    watchPassphraseKeyUpEvent('add-account');
    initCreateAccountForm();
    constructCoinsRepeaterEncrypt();
    helper.addCopyToClipboardFromElement('.generated-passhprase', 'Passphrase');
    $('.paste-from-clipboard-link').click(function() {
      $('#passphrase').val(pasteTextFromClipboard);
      if (pasteTextFromClipboard.length > 0) $('.btn-add-account').removeClass('disabled');
    });
  }
}

function addAuthorizationButtonAction(buttonClassName) {
  $('.btn-' + buttonClassName).click(function() {
    // validate passphrase
    // condition: 24 words in lower case followed by a single space character
    var passphraseInput = $('#passphrase').val(),
        totalSubstr = passphraseInput.match(/\b\w+\b/g),
        totalSubstrAlpha = passphraseInput.match(/\b[a-z]+\b/g), // count only words consist of characters
        totalSpaces = passphraseInput.match(/\s/g),
        api = new apiProto(),
        helper = new helperProto(),
        localStorage = new localStorageProto();

    if (isIguana) {
      if (checkIguanaCoinsSelection(buttonClassName === 'add-account' ? true : false)) {
        if (totalSubstr && totalSubstrAlpha && totalSpaces)
          if ((isDev || !isIguana) ? true : totalSubstr.length === 24 && totalSubstrAlpha.length === 24 && totalSpaces.length === 23) {
            if (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : verifyNewPassphrase() && api.walletEncrypt(passphraseInput)) {
              toggleLoginErrorStyling(false);

              if (buttonClassName === 'add-account') {
                helper.openPage('login');
              } else {
                localStorage.setVal('iguana-auth', { 'timestamp': Date.now() });
                helper.openPage('dashboard');
              }
            } else {
              toggleLoginErrorStyling(true);
            }
          } else {
            toggleLoginErrorStyling(true);
          }
        else
          toggleLoginErrorStyling(true);
      } else {
        $('.iguana-coins-repeater-error').html('<div class=\"center offset-bottom-sm\">Please select at least one coin</div>');
      }
    } else {
      if ($('.login-form')) {
        authAllAvailableCoind();
      }
      if ($('.create-account-form')) {
        if (totalSubstr && totalSubstrAlpha && totalSpaces)
          if ((isDev || !isIguana) ? true : totalSubstr.length === 24 && totalSubstrAlpha.length === 24 && totalSpaces.length === 23) {
            if (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : encryptCoindWallet()) {
              toggleLoginErrorStyling(false);

              if (buttonClassName === 'add-account') {
                helper.openPage('login');
              } else {
                localStorage.setVal('iguana-auth', { 'timestamp': Date.now() });
                helper.openPage('dashboard');
              }
            } else {
              toggleLoginErrorStyling(true);
            }
          } else {
            toggleLoginErrorStyling(true);
          }
        else
          toggleLoginErrorStyling(true);
      }
    }
  });
}

var iguanaCoinsRepeaterTemplate = '<div class=\"coin\" data-coin-id=\"{{ coin_id }}\">' +
                                    '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" {{ onclick_input }} />' +
                                    '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox-label cursor-pointer\" {{ onclick }}>' +
                                      '<span class=\"box\"></span><span class=\"label-text unselectable\">{{ name }}</span>' +
                                    '</label>' +
                                  '</div>';

var nonIguanaCoinsRepeaterTemplate = '<div class=\"coin block\" data-coin-id=\"{{ coin_id }}\">' +
                                       '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" />' +
                                       '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"iguana-coin-{{ coin_id }}-label checkbox-label cursor-pointer\">' +
                                         '<span class=\"box\"></span><span class=\"label-text unselectable\">{{ name }}</span>' +
                                       '</label>' +
                                       '<span class=\"iguana-coin-{{ coin_id }}-error\"></span>' +
                                       '<textarea name=\"iguana-coin-{{ coin_id }}-textarea\" id=\"iguana-coin-{{ coin_id }}-textarea\" class=\"iguana-coin-{{ coin_id }}-textarea offset-bottom-sm row center\">{{ value }}</textarea>' +
                                     '</div>';

function constructAuthCoinsRepeater() {
  var result = isIguana ? '<hr/>' : '',
      coinsRepeaterTemplate = isIguana ? iguanaCoinsRepeaterTemplate : nonIguanaCoinsRepeaterTemplate,
      localStorage = new localStorageProto(),
      helper = new helperProto(),
      index = 0;

  for (var key in coinsInfo) {
    if (!isIguana) localStorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });
    if ((isIguana && apiProto.prototype.getConf().coins[key].iguanaCurl !== "disabled") || (!isIguana && coinsInfo[key].connection === true && coinsInfo[key].iguana !== false)) {
      index++;
      result += coinsRepeaterTemplate.replace(/{{ coin_id }}/g, key).
                                      replace('{{ id }}', key.toUpperCase()).
                                      replace('{{ name }}', key.toUpperCase()).
                                      replace('{{ value }}', isDev && !isIguana ? (coinPW.coind[key] ? coinPW.coind[key] : '') : '').
                                      replace('{{ onclick }}', isIguana && coinsInfo[key].connection === true ? 'checked disabled' : '').
                                      replace('{{ onclick_input }}', isIguana && coinsInfo[key].connection === true && helper.getCurrentPage() === 'index' ? 'checked disabled' : '');
    }
  }

  if (!isIguana) {
    $('#passphrase').hide();
    $('.btn-signup').html('Encrypt wallet');
  }
  if (index !== 0 || isIguana) $('.coind-iguana-notice').hide();

  result = result + (!isIguana ? '<hr/>' : '');
  $(isIguana ? '.iguana-coins-repeater' : '.non-iguana-coins-repeater').html(result);
}

function constructCoinsRepeaterEncrypt() {
  var result = '<hr/><div class=\"center\"><div>Select a wallet you want to encrypt</div>';

  for (var key in coinsInfo) {
    if (isIguana && coinsInfo[key].connection === true) {
      selectedCoindToEncrypt = key;
    }

    if ((!isIguana && coinsInfo[key].connection === true) || isIguana) {
      result += iguanaCoinsRepeaterTemplate.replace(/{{ coin_id }}/g, key).
                                            replace('{{ id }}', key.toUpperCase()).
                                            replace('{{ name }}', key.toUpperCase()).
                                            replace('{{ onclick }}', isIguana && coinsInfo[key].connection === true ? '' : 'onmouseup=\"checkSelectedWallet(\'' + key + '\')\"').
                                            replace('{{ onclick_input }}', isIguana && coinsInfo[key].connection === true ? 'checked disabled' : '');
    }
  };

  result = result + '</div><hr/>';
  if ((isIguana && !selectedCoindToEncrypt) || !isIguana) $('.non-iguana-coins-repeater').html(result);
}

function encryptCoindWallet() {
  var api = new apiProto(),
      passphraseInput = $('#passphrase').val(),
      helper = new helperProto(),
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
          $('#debug-sync-info').append(key + ' coin added<br/>');
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

function watchPassphraseKeyUpEvent(buttonClassName) {
  $('#passphrase').keyup(function() {
    if ($('#passphrase').val().length > 0) {
      $('.btn-' + buttonClassName).removeClass('disabled');
    } else {
      $('.btn-' + buttonClassName).addClass('disabled');
    }
  });
}

function toggleLoginErrorStyling(isError) {
  var helper = new helperProto();

  if (isError) {
    if (isIguana && helper.getCurrentPage() === 'index') $('.login-input-directions-error.col-red').removeClass('hidden');
    $('#passphrase').addClass('error');
    $('.login-input-directions').addClass('hidden');
  } else {
    $('#passphrase').removeClass('error');
    $('.login-input-directions-error.col-red').addClass('hidden');
  }
  $('#passphrase').val('');
}

function verifyNewPassphrase() {
  if (passphraseToVerify === $('#passphrase').val()) return true;
  else return false;
}

function initCreateAccountForm() {
  var newPassphrase = PassPhraseGenerator.generatePassPhrase();

  selectedCoindToEncrypt = null;
  if (!isIguana) $('.btn-add-account').html('Encrypt wallet');

  $('#passphrase').show();
  $('.non-iguana-walletpassphrase-errors').html('');
  $('.verify-passphrase-form .login-input-directions-error').addClass('hidden');
  $('.verify-passphrase-form #passphrase').removeClass('error');
  $('.create-account-form').removeClass('hidden');
  $('.verify-passphrase-form').addClass('hidden');
  $('#passphrase').val('');
  $('#passphrase-saved-checkbox').prop('checked', false);
  $('.generated-passhprase').html(newPassphrase);
  $('.generated-passhprase').prop('data-clipboard-text', newPassphrase);
  console.log($('.generated-passhprase').prop('data-clipboard-text'));
  $('.btn-verify-passphrase').addClass('disabled');

  $('#passphrase-saved-checkbox').click(function() {
    if ($('#passphrase-saved-checkbox').prop('checked'))
      $('.btn-verify-passphrase').removeClass('disabled');
    else
      $('.btn-verify-passphrase').addClass('disabled');
  });

  $('.verify-passphrase-form .btn-back').click(function() {
    // TODO: refactor
    //initCreateAccountForm();
    helper = new helperProto();
    helper.openPage('create-account');
  });

  $('.create-account-form .btn-back').click(function() {
    var helper = new helperProto();
    helper.openPage('login');
  });

  $('.btn-verify-passphrase').click(function() {
    if (isIguana) {
      if (selectedCoindToEncrypt) {
        var api = new apiProto(),
            addCoinResult,
            coinIsRunning = false;

        for (var key in coinsInfo) {
          if (coinsInfo[key].connection === true) {
            coinIsRunning = true;
            addCoinResult = true;
          }
        }

        if (!coinIsRunning) addCoinResult = api.addCoin(selectedCoindToEncrypt);

        if (addCoinResult) {
          passphraseToVerify = $('.generated-passhprase').text();
          $('.create-account-form').addClass('hidden');
          $('.verify-passphrase-form').removeClass('hidden');
          $('.non-iguana-coins-repeater-errors').html('');
        } else {
          $('.non-iguana-coins-repeater-errors').html('<div class=\"center\">Something went wrong. Coin ' + selectedCoindToEncrypt + ' is not added.</div>');
        }
      } else {
        $('.non-iguana-coins-repeater-errors').html('<div class=\"center\">Please select at least one coin</div>');
      }
    } else {
      if (checkSelectedWallet()) {
        passphraseToVerify = $('.generated-passhprase').text();
        $('.create-account-form').addClass('hidden');
        $('.verify-passphrase-form').removeClass('hidden');
        $('.non-iguana-coins-repeater-errors').html('');
      } else {
        $('.non-iguana-coins-repeater-errors').html('<div class=\"center\">Please select at least one coin</div>');
      }
    }
  });
}