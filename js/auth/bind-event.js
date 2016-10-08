/*!
 * Iguana authorization/bind-event
 *
 */

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
        if (totalSubstr && totalSubstrAlpha && totalSpaces) {
          if ((dev.isDev || !isIguana) ? true : totalSubstr.length === 24 && totalSubstrAlpha.length === 24 && totalSpaces.length === 23) {
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
        } else {
          toggleLoginErrorStyling(true);
        }
      } else {
        $('.iguana-coins-repeater-error').html('<div class=\"center offset-bottom-sm\">Please select at least one coin</div>');
      }
    } else {
      if ($('.login-form')) {
        authAllAvailableCoind();
      }
      if ($('.verify-passphrase-form')) {
        $('.login-input-directions-error').removeClass('hidden');

        if (totalSubstr && totalSubstrAlpha && totalSpaces) {
          if ((dev.isDev || !isIguana) ? true : totalSubstr.length === 24 && totalSubstrAlpha.length === 24 && totalSpaces.length === 23) {
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
        } else
          toggleLoginErrorStyling(true);
          $('.login-input-directions-error').html('Passphrases do not match!');
          $('.login-input-directions-error').removeClass('hidden');
        }
      }
  });
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