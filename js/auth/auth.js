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