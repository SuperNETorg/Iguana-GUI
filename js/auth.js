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