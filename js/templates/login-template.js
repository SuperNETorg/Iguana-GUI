/*!
 * Iguana auth/login template
 *
 */

var loginTemplate =
'<div class="body-wrapper auth-main">' +
  '<div class="container-fluid">' +
    '<div class="row centered">' +
      '<section class="form-container login-form hidden">' +
        '<header class="form-header orange-gradient box-shadow-bottom">' +
          '<i class="bi_interface-cross cursor-pointer hidden"></i>' +
          '<div class="title text-shadow">Welcome to Iguana!</div>' +
        '</header>' +
        '<div class="form-content">' +
          '<div class="login-add-coin-selection">' +
            '<div class="login-add-coin-selection-title offset-bottom-sm cursor-pointer">Select a wallet</div>' +
          '</div>' +
          '<div class="login-input-directions center offset-bottom-sm unselectable">Enter a passphrase to log in</div>' +
          '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm row center"></textarea>' +
          /*'<div class="non-iguana-coins-repeater hidden"></div>' +
          '<div class="non-iguana-coins-repeater-error"></div>' +*/
          '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow row btn-signin">Log in</button>' +
          '<div class="login-or-delim center unselectable">or</div>' +
          '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-signup">Create an account</button>' +
          /*'<div class="iguana-coins-repeater"></div>' +
          '<div class="iguana-coins-repeater-error"></div>' +*/
        '</div>' +
      '</section>' +
    '</div>' +
  '</div>' +
'</div>';