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
  var newPassphrase = PassPhraseGenerator.generatePassPhrase(isIguana ? 8 : 4);

  selectedCoindToEncrypt = null;
  //if (!isIguana) $('.btn-add-account').html('Encrypt wallet');

  $('#passphrase').show();
  $('.non-iguana-walletpassphrase-errors').html('');
  $('.verify-passphrase-form .login-input-directions-error').addClass('hidden');
  $('.verify-passphrase-form #passphrase').removeClass('error');
  $('.create-account-form').removeClass('hidden');
  $('.verify-passphrase-form').addClass('hidden');
  $('#passphrase').val('');
  $('#passphrase-saved-checkbox').prop('checked', false);
  $('.generated-passhprase').html(newPassphrase);
  $('.generated-passhprase-hidden').val(newPassphrase);
  $('.btn-verify-passphrase').addClass('disabled');

  $('#passphrase-saved-checkbox').off();
  $('#passphrase-saved-checkbox').click(function() {
    if ($('#passphrase-saved-checkbox').prop('checked'))
      $('.btn-verify-passphrase').removeClass('disabled');
    else
      $('.btn-verify-passphrase').addClass('disabled');
  });

  $('.verify-passphrase-form .btn-back').off();
  $('.verify-passphrase-form .btn-back').click(function() {
    helper = new helperProto();
    helper.openPage('create-account');
  });

  $('.create-account-form .btn-back').off();
  $('.create-account-form .btn-back').click(function() {
    var helper = new helperProto();
    helper.openPage('login');
  });

  $('.btn-verify-passphrase').off();
  $('.btn-verify-passphrase').click(function() {
    if (isIguana) {
      var helper = new helperProto();
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
      if (coinsSelectedToAdd[0]) {
        var api = new apiProto(),
            addCoinResult,
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
          $('.login-add-coin-selection-title').addClass('hidden');
          passphraseToVerify = $('.generated-passhprase').text();
          $('.create-account-form').addClass('hidden');
          $('.verify-passphrase-form').removeClass('hidden');
          $('.non-iguana-coins-repeater-errors').html('');
        } else {
          helper.prepMessageModal('Something went wrong. Coin ' + coinsSelectedToAdd[0] + ' is not added.', 'red', true);
        }
      } else {
        $('.login-add-coin-selection-title').removeClass('hidden');
        helper.prepMessageModal('Please select a coin', 'blue', true);
      }
    } else {
      if (checkSelectedWallet()) {
        passphraseToVerify = $('.generated-passhprase').text();
        $('.create-account-form').addClass('hidden');
        $('.verify-passphrase-form').removeClass('hidden');
        $('.non-iguana-coins-repeater-errors').html('');
      } else {
        //$('.non-iguana-coins-repeater-errors').html('<div class=\"center\">Please select at least one coin</div>');
      }
    }
  });
}