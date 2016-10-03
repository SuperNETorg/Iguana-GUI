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
               '\x3Cscript type=\"text/javascript\" src=\"js/auth/coind-auth.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/auth/repeater.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/auth/bind-event.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/auth/init.js\">\x3C/script>');

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