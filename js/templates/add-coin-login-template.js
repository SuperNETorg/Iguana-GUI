/*!
 * Iguana auth/add-coin-login template
 *
 */

var addCoinLoginTemplate =
'<section class="form-container add-coin-login-form unselectable hidden fade auth-main">' +
  '<div class="modal-overlay"></div>' +
  '<div class="modal modal-add-coin-login-form login-form">' +
    '<header class="form-header orange-gradient box-shadow-bottom">' +
      '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
      '<div class="title text-shadow">{{ modal_title }}</div>' +
    '</header>' +
    '<div class="form-content">' +
      '<div class="login-add-coin-selection">' +
        '<div class="login-add-coin-selection-title offset-bottom-sm cursor-pointer">{{ cta_title }}</div>' +
      '</div>' +
      '<div class="login-input-directions-error center offset-bottom-sm col-red hidden unselectable">Incorrect input. Passphrase must consist of {{ word_count }} words. Try one more time.</div>' +
      '<div class="login-input-directions center offset-bottom-sm unselectable passphrase-text">Enter a passphrase to add {{ item }}</div>' +
      '<textarea name="loginPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm row center"></textarea>' +
      '<div class="non-iguana-coins-repeater hidden"></div>' +
      '<div class="non-iguana-coins-repeater-error"></div>' +
      '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow row btn-signin">Add</button>' +
      '<div class="login-or-delim center unselectable{{ visibility }}">or</div>' +
      '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-signup{{ visibility }}">Create an account</button>' +
      '<div class="iguana-coins-repeater"></div>' +
      '<div class="iguana-coins-repeater-error"></div>' +
    '</div>' +
  '</div>' +
'</section>';