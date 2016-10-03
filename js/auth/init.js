/*!
 * Iguana auth/init
 *
 */

function initAuthCB() {
  var localStorage = new localStorageProto(),
      helper = new helperProto(),
      selectedCoindToEncrypt;

  // ugly login form check
  if ($('.login-form')) {
    $('#passphrase').val(dev.isDev && isIguana ? dev.coinPW.iguana : '');

    if (dev.isDev) $('.btn-signin').removeClass('disabled');

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
        if (pasteTextFromClipboard)
          $('#passphrase').val(pasteTextFromClipboard); // not quite appropriate pasting
          if ($('#passphrase').val().length > 0) $('.btn-add-account').removeClass('disabled');
      } catch(e) {
        // do nothing
      }
    });
  }
}