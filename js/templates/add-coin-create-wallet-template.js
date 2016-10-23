/*!
 * Iguana auth/add-coin-create-wallet template
 *
 */

var addCoinCreateWalletTemplate =
'<section class="form-container mdl add-coin-create-wallet-form unselectable hidden fade auth-main">' +
  '<div class="modal-overlay"></div>' +
  '<div class="modal modal-add-coin-wallet-create-form">' +
    '<section class="create-account-form">' +
      '<header class="form-header orange-gradient box-shadow-bottom">' +
        '<i class="bi_interface-arrow-left text-shadow cursor-pointer btn-close"></i>' +
        '<div class="title text-shadow">Add account</div>' +
      '</header>' +
      '<div class="form-content">' +
        '<div class="login-add-coin-selection">' +
          '<div class="login-add-coin-selection-title offset-bottom-sm cursor-pointer">Select a wallet</div>' +
        '</div>' +
        '<div class="login-input-directions center offset-bottom-md unselectable passphrase-word-count">Write down this {{ word_count }}-word passphrase and keep it safe. You can\'t access or restore your account, if you lose it! <strong>Don\'t ever disclose your passphrase!</strong></div>' +
        '<div class="passphrase-container row center offset-bottom-md">' +
          '<div class="title unselectable">Passphrase (click on the text below to copy it):</div>' +
          '<div class="generated-passhprase cursor-pointer"></div>' +
          '<input type="text" class="generated-passhprase-hidden cursor-pointer"></input>' +
        '</div>' +
        '<input type="checkbox" id="passphrase-saved-checkbox" name="passphraseSaved" class="checkbox" />' +
        '<label for="passphrase-saved-checkbox" class="checkbox-label cursor-pointer">' +
          '<span class="box"></span><span class="label-text unselectable">I saved the passphrase in a secure place</span>' +
        '</label>' +
        '<div class="non-iguana-coins-repeater hidden"></div>' +
        '<div class="non-iguana-coins-repeater-errors"></div>' +
        '<div class="login-or-delim center"></div>' +
        '<button class="btn btn-block disabled orange-gradient box-shadow-all text-shadow row btn-verify-passphrase">Next</button>' +
      '</div>' +
    '</section>' +
    '<!-- // create account form end -->' +
    '<!-- // verify passphrase form start -->' +
    '<section class="verify-passphrase-form hidden">' +
      '<header class="form-header orange-gradient box-shadow-bottom">' +
        '<i class="bi_interface-arrow-left text-shadow cursor-pointer btn-back"></i>' +
        '<div class="title text-shadow">Add account</div>' +
      '</header>' +
      '<div class="form-content">' +
        '<div class="login-input-directions-error center offset-bottom-sm col-red hidden unselectable passphrase-word-count">Incorrect input. Passphrase must consist of {{ word_count }} words. Try one more time.</div>' +
        '<div class="login-input-directions center offset-bottom-sm unselectable">Type or paste the passphrase to confirm you saved it properly. <span class="paste-from-clipboard-link cursor-pointer">Click here to paste from the clipboard.</span></div>' +
        '<textarea name="verifyPassphrase" id="passphrase" class="login-passphrase-textarea offset-bottom-sm row center"></textarea>' +
        '<div class="non-iguana-walletpassphrase-errors"></div>' +
        '<div class="login-or-delim center unselectable"></div>' +
        '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-add-account disabled">Add account</button>' +
      '</div>' +
    '</section>' +
    '<!-- // verify passphrase form end -->' +
  '</div>' +
'</section>';