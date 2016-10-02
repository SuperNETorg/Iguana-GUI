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

document.write('\x3Cscript type=\"text/javascript\" src=\"js/auth/wallet-create.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/auth/coind-auth.js\">\x3C/script>');

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
    addAuthorizationButtonAction('add-account');
    watchPassphraseKeyUpEvent('add-account');
    initCreateAccountForm();
    constructCoinsRepeaterEncrypt();
    helper.addCopyToClipboardFromElement('.generated-passhprase', 'Passphrase');
    $('.paste-from-clipboard-link').click(function() {
      try {
        $('#passphrase').val(pasteTextFromClipboard); // not quite appropriate pasting
      } catch(e) {
        // do nothing
      }
      if ($('#passphrase').length > 0) $('.btn-add-account').removeClass('disabled');
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

function watchPassphraseKeyUpEvent(buttonClassName) {
  $('#passphrase').keyup(function() {
    if ($('#passphrase').val().length > 0) {
      $('.btn-' + buttonClassName).removeClass('disabled');
    } else {
      $('.btn-' + buttonClassName).addClass('disabled');
    }
  });
}