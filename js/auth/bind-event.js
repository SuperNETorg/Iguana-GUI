/*!
 * Iguana authorization/bind-event
 *
 */

function addAuthorizationButtonAction(buttonClassName) {
  var helper = new helperProto();

  $('.btn-' + buttonClassName).off();
  $('.btn-' + buttonClassName).click(function() {
    if (isIguana) {
      if (!checkIguanaCoinsSelection(buttonClassName === 'add-account' ? true : false)) {
        helper.prepMessageModal('Please select a coin', 'blue', true);
      } else {
        //addAccountIguanaCoind('signin');
      }
    } else {
      if (!$('.login-form').hasClass('hidden')) {
        authAllAvailableCoind();
      }
      if ($('.verify-passphrase-form').width()) {
        $('.login-input-directions-error').removeClass('hidden');
        addAccountIguanaCoind(buttonClassName, true);
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
      api = new apiProto(),
      helper = new helperProto();

  if (totalSubstr && totalSubstrAlpha && totalSpaces) {
    if ((dev.isDev || !isIguana) ? true : totalSubstr.length === 24 && totalSubstrAlpha.length === 24 && totalSpaces.length === 23) {
      if (!isCoind ? (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : verifyNewPassphrase() && api.walletEncrypt(passphraseInput)) :
                     (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : encryptCoindWallet())) {
        toggleLoginErrorStyling(false);

        if (buttonClassName === 'add-account') {
          helper.openPage('login');
        } else {
          localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
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

    if (isCoind)
      helper.prepMessageModal('Passphrases do not match!', 'red', true);
      $('.login-input-directions-error').removeClass('hidden');
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