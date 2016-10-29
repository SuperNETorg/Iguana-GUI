/*!
 * Iguana authorization
 *
 */

var passphraseToVerify,
    coindAuthResults = [];

function toggleLoginErrorStyling(isError) {
  var passphrase = $('#passphrase'),
      loginInputDirectionsError = $('.login-input-directions-error.col-red'),
      loginInputDirections = $('.login-input-directions'),
      errorClassName = 'error',
      hiddenClassName = 'hidden';

  if (isError) {
    if (isIguana && helper.getCurrentPage() === 'login') loginInputDirectionsError.removeClass(hiddenClassName);
    passphrase.addClass(errorClassName);
    loginInputDirections.addClass(hiddenClassName);
  } else {
    passphrase.removeClass(errorClassName);
    loginInputDirectionsError.addClass(hiddenClassName);
  }
  passphrase.val('');
}