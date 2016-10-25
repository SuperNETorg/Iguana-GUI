/*!
 * Iguana authorization
 *
 */

var passphraseToVerify,
    coindAuthResults = [];

function toggleLoginErrorStyling(isError) {
  if (isError) {
    if (isIguana && helper.getCurrentPage() === 'login') $('.login-input-directions-error.col-red').removeClass('hidden');
    $('#passphrase').addClass('error');
    $('.login-input-directions').addClass('hidden');
  } else {
    $('#passphrase').removeClass('error');
    $('.login-input-directions-error.col-red').addClass('hidden');
  }
  $('#passphrase').val('');
}