/*!
 * Iguana dashboard/send-coin-passphrase template
 *
 */

'use_strict';

templates.registerTemplate('sendCoinPassphrase',
  '<section class="form-container mdl login-form-modal hidden fade">' +
    '<div class="modal-overlay"></div>' +
    '<div class="modal block modal-add-coin-login" role="document">' +
      '<div class="modal-dialog modal-lg">' +
        '<div class="modal-content">' +
          '<header class="modal-header form-header orange-gradient box-shadow-bottom">' +
            '<i class="bi_interface-arrow-left cursor-pointer btn-back"></i>' +
            '<div class="title text-shadow">' + helper.lang('PASSPHRASE_MODAL.ADD_A_WALLET') + '</div>' +
          '</header>' +
          '<div class="modal-body form-content">' +
            '<div class="login-input-directions center offset-bottom-sm unselectable">' + helper.lang('PASSPHRASE_MODAL.ENTER_A_PASSPHRASE') + '</div>' +
            '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm center"></textarea>' +
            '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow btn-add-wallet">' + helper.lang('LOGIN.ADD') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</section>');