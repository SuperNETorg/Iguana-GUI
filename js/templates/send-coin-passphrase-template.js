/*!
 * Iguana dashboard/send-coin-passphrase template
 *
 */

var sendCoinPassphraseTemplate =
'<section class="form-container login-form-modal hidden fade">' +
  '<div class="modal-overlay"></div>' +
  '<div class="modal modal-add-coin-login">' +
    '<header class="form-header orange-gradient box-shadow-bottom">' +
      '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
      '<div class="title text-shadow">Add a wallet</div>' +
    '</header>' +
    '<div class="form-content">' +
      '<div class="login-input-directions center offset-bottom-sm unselectable">Enter a passphrase to add wallet</div>' +
      '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm row center"></textarea>' +
      '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow row btn-add-wallet">Add</button>' +
    '</div>' +
  '</div>' +
'</section>';