/*!
 * Iguana auth/add-coin-login template
 *
 */

'use_strict';

templates.registerTemplate('addCoinLogin',
'<section class="form-container mdl add-coin-login-form unselectable hidden fade auth-main">' +
  '<div class="modal-overlay"></div>' +
  '<div class="modal modal-add-coin-login-form login-form" role="document">' +
    '<div class="modal-dialog modal-md modal-popup">' +
      '<div class="modal-content">' +
        '<header class="modal-header orange-gradient box-shadow-bottom">' +
          '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
          '<div class="title text-shadow text-center">{{ modal_title }}</div>' +
        '</header>' +
        '<div class="form-content modal-body">' +
          '<div class="login-add-coin-selection">' +
            '<div class="login-add-coin-selection-title cursor-pointer">{{ cta_title }}</div>' +
          '</div>' +
          '<div class="login-input-directions-error center offset-bottom-sm col-red hidden unselectable">' + helper.lang('LOGIN.INCORRECT_INPUT_P1') + ' {{ word_count }} ' + helper.lang('LOGIN.INCORRECT_INPUT_P2') + '</div>' +
          '<div class="login-input-directions center offset-bottom-sm unselectable passphrase-text">' + helper.lang('LOGIN.ENTER_A_PASSPHRASE_TO_ADD') + ' {{ item }}</div>' +
          '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm row center"></textarea>' +
          '<div class="non-iguana-coins-repeater hidden"></div>' +
          '<div class="non-iguana-coins-repeater-error"></div>' +
          '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow row btn-signin">' + helper.lang('LOGIN.ADD') + '</button>' +
          '<div class="login-or-delim center unselectable{{ visibility }}">' + helper.lang('LOGIN.OR') + '</div>' +
          '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-signup{{ visibility }}">' + helper.lang('LOGIN.CREATE_ACCOUNT') + '</button>' +
          '<div class="iguana-coins-repeater"></div>' +
          '<div class="iguana-coins-repeater-error"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</section>');
