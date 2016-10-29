/*!
 * Iguana authorization, create wallet, verify passphrase
 *
 */
var passphraseToVerify;

function verifyNewPassphrase(modalClassName) {
  if (passphraseToVerify === $((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val()) return true;
  else return false;
}

function initCreateAccountForm() {
  var newPassphrase = PassPhraseGenerator.generatePassPhrase(isIguana ? 8 : 4), // TODO: make configurable
      hiddenClassName = 'hidden',
      disabledClassName = 'disabled',
      verifyAccounFormClassName = '.verify-passphrase-form',
      createAccountFormClassName = '.create-account-form',
      buttonVerifyPassphrase = $('.btn-verify-passphrase'),
      loginAddCoinSelection = $('.login-add-coin-selection-title'),
      passphrase = $('#passphrase'),
      generatedPassphrase = $('.generated-passhprase'),
      passphraseSavedCheckbox = $('#passphrase-saved-checkbox');

  selectedCoindToEncrypt = null;
  //if (!isIguana) $('.btn-add-account').html('Encrypt wallet');

  passphrase.show();
  $('.non-iguana-walletpassphrase-errors').html(''); // remove(?)
  $(verifyAccounFormClassName + ' .login-input-directions-error').addClass(hiddenClassName);
  $(verifyAccounFormClassName + ' #passphrase').removeClass('error');
  $(createAccountFormClassName).removeClass(hiddenClassName);
  $(verifyAccounFormClassName).addClass(hiddenClassName);
  passphrase.val('');
  passphraseSavedCheckbox.prop('checked', false);
  generatedPassphrase.html(newPassphrase);
  $('.generated-passhprase-hidden').val(newPassphrase);
  buttonVerifyPassphrase.addClass(disabledClassName);

  passphraseSavedCheckbox.off();
  passphraseSavedCheckbox.click(function() {
    if (passphraseSavedCheckbox.prop('checked'))
      buttonVerifyPassphrase.removeClass(disabledClassName);
    else
      buttonVerifyPassphrase.addClass(disabledClassName);
  });

  $(verifyAccounFormClassName + ' .btn-back').off();
  $(verifyAccounFormClassName + ' .btn-back').click(function() {
    helper.openPage('create-account');
  });

  $(createAccountFormClassName + ' .btn-back').off();
  $(createAccountFormClassName + ' .btn-back').click(function() {
    helper.openPage('login');
  });

  buttonVerifyPassphrase.off();
  buttonVerifyPassphrase.click(function() {
    if (isIguana) {
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
      if (coinsSelectedToAdd[0]) {
        var addCoinResult,
            coinIsRunning = false;

        for (var key in coinsInfo) {
          if (coinsInfo[key].connection === true) {
            coinIsRunning = true;
            addCoinResult = true;
          }
        }

        if (!coinIsRunning) addCoinResult = api.addCoin(coinsSelectedToAdd[0]);

        if (addCoinResult) {
          coinsInfo[coinsSelectedToAdd[0]].connection = true;
          loginAddCoinSelection.addClass(hiddenClassName);
          passphraseToVerify = generatedPassphrase.text();
          $(createAccountFormClassName).addClass('hidden');
          $(verifyAccounFormClassName).removeClass('hidden');
          $('.non-iguana-coins-repeater-errors').html(''); // remove(?)
        } else {
          helper.prepMessageModal(helper.lang('MESSAGE.COIN_ADD_ERROR_P1') + ' ' + coinsSelectedToAdd[0] + ' ' + helper.lang('MESSAGE.COIN_ADD_ERROR_P2'), 'red', true);
        }
      } else {
        loginAddCoinSelection.removeClass(hiddenClassName);
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_COIN'), 'blue', true);
      }
    } else {
      if (checkSelectedWallet()) {
        passphraseToVerify = generatedPassphrase.text();
        $(createAccountFormClassName).addClass(hiddenClassName);
        $(verifyAccounFormClassName).removeClass(hiddenClassName);
        $('.non-iguana-coins-repeater-errors').html(''); // remove(?)
      } else {
        //$('.non-iguana-coins-repeater-errors').html('<div class=\"center\">Please select at least one coin</div>');
      }
    }
  });
}