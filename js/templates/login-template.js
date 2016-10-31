/*!
 * Iguana auth/login template
 *
 */

'use_strict';

templates.registerTemplate('login',
'<div class="body-wrapper auth-main">' +
  '<div class="container-fluid">' +
    '<div class="row centered">' +
      '<section class="form-container login-form hidden">' +
        '<header class="form-header orange-gradient box-shadow-bottom">' +
          '<i class="bi_interface-cross cursor-pointer hidden"></i>' +
          '<div class="title text-shadow">' + helper.lang('LOGIN.WELCOME') + '</div>' +
        '</header>' +
        '<div class="form-content">' +
          '<div class="login-add-coin-selection">' +
            '<div class="login-add-coin-selection-title offset-bottom-sm cursor-pointer">' + helper.lang('LOGIN.SELECT_A_WALLET') + '</div>' +
          '</div>' +
          '<div class="login-input-directions center offset-bottom-sm unselectable">' + helper.lang('LOGIN.ENTER_A_PASSPHRASE_TO_LOGIN') + '</div>' +
          '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm row center"></textarea>' +
          /*'<div class="non-iguana-coins-repeater hidden"></div>' +
          '<div class="non-iguana-coins-repeater-error"></div>' +*/
          '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow row btn-signin">' + helper.lang('LOGIN.LOGIN') + '</button>' +
          '<div class="login-or-delim center unselectable">or</div>' +
          '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-signup">' + helper.lang('LOGIN.CREATE_ACCOUNT') + '</button>' +
          /*'<div class="iguana-coins-repeater"></div>' +
          '<div class="iguana-coins-repeater-error"></div>' +*/
        '</div>' +
      '</section>' +
    '</div>' +
  '</div>' +
'</div>');