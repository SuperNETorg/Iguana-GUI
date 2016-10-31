/*!
 * Iguana dashboard/send-coin-passphrase template
 *
 */

'use_strict';

templates.registerTemplate('sendCoinPassphrase',
'<section class="form-container mdl login-form-modal hidden fade">' +
  '<div class="modal-overlay"></div>' +
  '<div class="modal modal-add-coin-login">' +
    '<header class="form-header orange-gradient box-shadow-bottom">' +
      '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
      '<div class="title text-shadow">' + helper.lang('PASSPHRASE_MODAL.ADD_A_WALLET') + '</div>' +
    '</header>' +
    '<div class="form-content">' +
      '<div class="login-input-directions center offset-bottom-sm unselectable">' + helper.lang('PASSPHRASE_MODAL.ENTER_A_PASSPHRASE') + '</div>' +
      '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm center"></textarea>' +
      '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow btn-add-wallet">' + helper.lang('LOGIN.ADD') + '</button>' +
    '</div>' +
  '</div>' +
'</section>');