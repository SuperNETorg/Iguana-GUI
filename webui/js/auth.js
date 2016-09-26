/*!
 * Iguana authorization
 *
 */

var passphraseToVerify;

$(document).ready(function() {
  var localStorage = new localStorageProto(),
      helper = new helperProto();

  // ugly login form check
  if ($('.login-form')) {
    $('#passphrase').val(isDev && isIguana ? coinPW.iguana : '');

    if (isDev) $('.btn-signin').removeClass('disabled');

    if (helper.checkSession(true)) {
      helper.openPage('dashboard');
    } else {
      $('.login-form').removeClass('hidden');
    }

    constructIguanaCoinsRepeater();

    addAuthorizationButtonAction('signin');
    watchPassphraseKeyUpEvent('signin');

    $('.login-form .btn-signup').click(function() {
      helper.openPage('create-account');
    });
  }

  if ($('.create-account-form').width()) {
    addAuthorizationButtonAction('add-account');
    watchPassphraseKeyUpEvent('add-account');
    initCreateAccountForm();
  }
});

function authWallet() {
  api.walletLogin(passphraseInput, defaultSessionLifetime);
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
      if (checkIguanaCoinsSelection()) {
        if (totalSubstr && totalSubstrAlpha && totalSpaces)
          // wallet passphrase check is temp disabled to work in coind env
          if ((isDev || !isIguana) ? true : totalSubstr.length === 24 && totalSubstrAlpha.length === 24 && totalSpaces.length === 23) {
            if (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : api.walletCreate(passphraseInput) && verifyNewPassphrase()) {
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
        alert('Please select at least one coin');
      }
    } else {
      authAllAvailableCoind();
    }
  });
}

var iguanaCoinsRepeaterTemplate = '<div class=\"coin\" data-coin-id=\"{{ coin_id }}\">' +
                                    '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" {{ checked }} />' +
                                    '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox-label cursor-pointer\">' +
                                      '<span class=\"box\"></span><span class=\"label-text unselectable\">{{ name }}</span>' +
                                    '</label>' +
                                  '</div>';

var nonIguanaCoinsRepeaterTemplate = '<div class=\"coin block\" data-coin-id=\"{{ coin_id }}\">' +
                                    '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" {{ checked }} />' +
                                    '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox-label cursor-pointer\">' +
                                      '<span class=\"box\"></span><span class=\"label-text unselectable\">{{ name }}</span>' +
                                    '</label>' +
                                    '<textarea name=\"iguana-coin-{{ coin_id }}-textarea\" id=\"iguana-coin-{{ coin_id }}-textarea\" class=\"iguana-coin-{{ coin_id }}-textarea offset-bottom-sm row center\">{{ value }}</textarea>' +
                                  '</div>';

function constructIguanaCoinsRepeater() {
  var result = isIguana ? '<hr/>' : '',
      coinsRepeaterTemplate = isIguana ? iguanaCoinsRepeaterTemplate : nonIguanaCoinsRepeaterTemplate,
      index = 0;

  for (var key in coinsInfo) {
    if ((isIguana && coinsInfo[key].connection !== true) || (!isIguana && coinsInfo[key].connection === true && coinsInfo[key].iguana !== false)) {
      index++;
      result += coinsRepeaterTemplate.replace(/{{ coin_id }}/g, key).
                                            replace('{{ id }}', key.toUpperCase()).
                                            replace('{{ checked }}', isIguana ? '' : 'checked disabled').
                                            replace('{{ name }}', key.toUpperCase()).
                                            replace('{{ value }}', isDev && !isIguana ? coinPW.coind[key] : '');
    }
  };

  if (!isIguana) $('#passphrase').hide();
  if (index !== 0) $('.coind-iguana-notice').hide();

  result = result + (!isIguana ? '<hr/>' : '');
  $(isIguana ? '.iguana-coins-repeater' : '.non-iguana-coins-repeater').html(result);
}

function checkIguanaCoinsSelection() {
  var result = false,
      api = new apiProto();

  for (var key in coinsInfo) {
    if ($('#iguana-coin-' + key + '-checkbox').prop('checked')) {
      if (api.addCoin(key)) {
        $('#debug-sync-info').append(key + ' coin added<br/>');
        coinsInfo[key].connection = true;
        result = true;
      }
    }

    if (isIguana && coinsInfo[key].connection === true || result === true) {
      result = true;
    }
  }

  constructIguanaCoinsRepeater();

  return result;
}

function authAllAvailableCoind() {
  var coindAuthResults = [],
      api = new apiProto(),
      helper = new helperProto(),
      localStorage = new localStorageProto();

  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      var coindWalletLogin = api.walletLogin($('#iguana-coin-' + key + '-textarea').val(), defaultSessionLifetime, key);
      coindAuthResults.push(coindWalletLogin);
    }
  };

  console.log(coindAuthResults);
  localStorage.setVal('iguana-auth', { 'timestamp': Date.now() });
  helper.openPage('dashboard');
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
  if (isError) {
    $('#passphrase').addClass('error');
    $('.login-input-directions-error.col-red').removeClass('hidden');
    $('.login-input-directions').addClass('hidden');
  } else {
    $('#passphrase').removeClass('error');
    $('.login-input-directions-error.col-red').addClass('hidden');
  }
  $('#passphrase').val('');
}

function verifyNewPassphrase() {
  var localStorage = new localStorageProto();

  if (passphraseToVerify === $('#passphrase').val()) {
    return true;
  } else {
    return false;
  }
}

function initCreateAccountForm() {
  var newPassphrase = PassPhraseGenerator.generatePassPhrase();

  $('.create-account-form').removeClass('hidden');
  $('.verify-passphrase-form').addClass('hidden');
  $('#passphrase').val('');

  $('#passphrase-saved-checkbox').prop('checked', false);
  $('.generated-passhprase').html(newPassphrase);
  $('.btn-verify-passphrase').addClass('disabled');

  $('#passphrase-saved-checkbox').click(function() {
    if ($('#passphrase-saved-checkbox').prop('checked'))
      $('.btn-verify-passphrase').removeClass('disabled');
    else
      $('.btn-verify-passphrase').addClass('disabled');
  });

  $('.verify-passphrase-form .btn-back').click(function() {
    initCreateAccountForm();
  });

  $('.create-account-form .btn-back').click(function() {
    var helper = new helperProto();
    helper.openPage('login');
  });

  $('.btn-verify-passphrase').click(function() {
    passphraseToVerify = $('.generated-passhprase').text();
    $('.create-account-form').addClass('hidden');
    $('.verify-passphrase-form').removeClass('hidden');
  });
}