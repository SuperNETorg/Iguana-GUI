/*!
 * Iguana authorization/bind-event
 *
 */

function addAuthorizationButtonAction(buttonClassName) {
  var hiddenClassName = 'hidden',
      button = $('.btn-' + buttonClassName),
      loginForm = $('.login-form'),
      verifyPassphraseForm = $('.verify-passphrase-form'),
      loginInputDirectionsError = $('.login-input-directions-error');

  button.off();
  button.click(function() {
    if (isIguana) {
      if (!checkIguanaCoinsSelection(buttonClassName === 'add-account' ? true : false)) {
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_COIN'), 'blue', true);
      } else {
        if (helper.getCurrentPage() === 'create-account') addAccountIguanaCoind('add-account');
      }
    } else {
      if (!checkIguanaCoinsSelection(buttonClassName === 'add-account' ? true : false)) {
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
      } else {
        if (!verifyPassphraseForm.hasClass(hiddenClassName)) {
          authAllAvailableCoind();
        }
        if (loginForm.width() || helper.getCurrentPage() === 'login') {
          loginInputDirectionsError.removeClass(hiddenClassName);
          if (helper.getCurrentPage() === 'create-account') addAccountIguanaCoind(buttonClassName);
        }
        if (!loginForm.width() || helper.getCurrentPage() === 'create-account') addAccountIguanaCoind('add-account', true);
      }
    }
  });
}

function addAccountIguanaCoind(buttonClassName, isCoind) {
  // validate passphrase
  // iguana env condition: 24 words in lower case followed by a single space character
  var passphraseInput = $('#passphrase').val(),
      totalSubstr = passphraseInput.match(/\b\w+\b/g),
      totalSubstrAlpha = passphraseInput.match(/\b[a-z]+\b/g), // count only words consist of characters
      totalSpaces = passphraseInput.match(/\s/g),
      passphraseLength = 24, // words
      hiddenClassName = 'hidden',
      loginInputDirectionsError = $('.login-input-directions-error');

  if (totalSubstr && totalSubstrAlpha && totalSpaces) {
    //if ((buttonClassName === 'signin') ? true : totalSubstr.length === passphraseLength && totalSubstrAlpha.length === passphraseLength && totalSpaces.length === passphraseLength - 1) {
      if (!isCoind ? (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : verifyNewPassphrase() && api.walletEncrypt(passphraseInput)) :
                     (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : encryptCoindWallet())) {
        toggleLoginErrorStyling(false);

        if (buttonClassName === 'add-account') {
          helper.openPage('login');
          setTimeout(function() {
            helper.prepMessageModal(helper.lang('MESSAGE.WALLET_IS_CREATED'), 'green', true);
          }, 300);
        } else {
          localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
          helper.openPage('dashboard');
        }
      } else {
        toggleLoginErrorStyling(true);
      }
    /*} else {
      toggleLoginErrorStyling(true);
    }*/
  } else {
    toggleLoginErrorStyling(true);

    if (isCoind) {
      helper.prepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH'), 'red', true);
      loginInputDirectionsError.removeClass(hiddenClassName);
    } else {
      helper.prepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH'), 'red', true);
      loginInputDirectionsError.removeClass(hiddenClassName);
    }
  }
}

function watchPassphraseKeyUpEvent(buttonClassName) {
  var passphrase = $('#passphrase'),
    button = $('.btn-' + buttonClassName);

  $('.auth-main').on('DOMSubtreeModified', function () {
    watchPassphraseKey(passphrase, button)
  });
  passphrase.keyup(function() {
    watchPassphraseKey(passphrase, button)
  });
}

function watchPassphraseKey(passphrase, button) {
  var disabledClassName = 'disabled';
  if (passphrase.val().length > 0) {
    button.removeClass(disabledClassName);
  } else {
    button.addClass(disabledClassName);
  }
}