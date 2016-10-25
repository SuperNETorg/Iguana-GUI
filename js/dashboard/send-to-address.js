/*!
 * Iguana dashboard/send-to-address
 *
 */

var sendFormDataCopy = {};

function sendCoinModalInit(isBackTriggered) {
  var helper = new helperProto();

  var templateToLoad = sendCoinEntryTemplate,
      activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
      coinData = getCoinData(activeCoin),
      activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
      activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html()),
      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);

  // prep template
  templateToLoad = templateToLoad.
                   replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                   replace('{{ coin_name }}', coinData.name).
                   replace(/{{ currency }}/g, defaultCurrency).
                   replace('{{ coin_value }}', activeCoinBalanceCoin).
                   replace('{{ currency_value }}', activeCoinBalanceCurrency).
                   replace('{{ address }}', isBackTriggered ? sendFormDataCopy.address || '' : '').
                   replace('{{ amount }}', isBackTriggered ? sendFormDataCopy.amount || 0 : '').
                   replace('{{ fee }}', isBackTriggered ? sendFormDataCopy.fee || 0 : coinsInfo[coinData.id].relayFee || 0.00001).
                   replace('{{ fee_currency }}', isBackTriggered ? sendFormDataCopy.feeCurrency || 0 : (coinsInfo[coinData.id].relayFee || 0.00001 * currentCoinRate).toFixed(8)).
                   replace('{{ note }}', isBackTriggered ? sendFormDataCopy.note || '' : '');

  $('.modal-send-coin').html(templateToLoad);

  if (!currentCoinRate) {
    $('.modal-send-coin .tx-amount-currency').val(0);
    $('.modal-send-coin .tx-fee-currency').val(0);
    $('.modal-send-coin .tx-amount-currency').attr('disabled', true);
    $('.modal-send-coin .tx-fee-currency').attr('disabled', true);
  }

  // ref: http://jsfiddle.net/dinopasic/a3dw74sz/
  // allow numeric only entry
  $('.modal-send-coin .tx-amount,.modal-send-coin .tx-amount-currency,.modal-send-coin .tx-fee,.modal-send-coin .tx-fee-currency').keypress(function (event) {
    var inputCode = event.which,
        currentValue = $(this).val();
    if (inputCode > 0 && (inputCode < 48 || inputCode > 57)) {
      if (inputCode == 46) {
        if (helperProto.prototype.getCursorPositionInputElement($(this)) == 0 && currentValue.charAt(0) == '-') return false;
        if (currentValue.match(/[.]/)) return false;
      }
      else if (inputCode == 45) {
        if (currentValue.charAt(0) == '-') return false;
        if (helperProto.prototype.getCursorPositionInputElement($(this)) != 0) return false;
      }
      else if (inputCode == 8) return true;
      else return false;
    }
    else if (inputCode > 0 && (inputCode >= 48 && inputCode <= 57)) {
      if (currentValue.charAt(0) == '-' && helperProto.prototype.getCursorPositionInputElement($(this)) == 0) return false;
    }
  });

  // calc on keying
  $('.modal-send-coin .tx-amount').keydown(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-amount', true, $(this).val());
  });
  $('.modal-send-coin .tx-amount-currency').keydown(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-amount', false);
  });
  $('.modal-send-coin .tx-fee').keydown(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-fee', true);
  });
  $('.modal-send-coin .tx-fee-currency').keydown(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-fee', false);
  });

  function txAmountFeeKeyupEvent(evt, fieldName, type, val) {
    var keyCode = evt.keyCode || evt.which;

    if (keyCode !== 9) {
      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);

      if (type) {
        $('.modal-send-coin .' + fieldName + '-currency').val(($('.modal-send-coin .' + fieldName).val() * currentCoinRate).toFixed(helper.decimalPlacesFormat($('.modal-send-coin .' + fieldName).val() * currentCoinRate).coin));
      } else {
        $('.modal-send-coin .' + fieldName).val(($('.modal-send-coin .' + fieldName + '-currency').val() / currentCoinRate).toFixed(helper.decimalPlacesFormat($('.modal-send-coin .' + fieldName + '-currency').val() / currentCoinRate).coin));
      }
    } else {
      evt.preventDefault();
    }

    if (keyCode === 189 || keyCode === 173 || keyCode === 109) { // disable "-" entry
      evt.preventDefault();
    }
  }

  // dev
  //if (dev.isDev) loadTestSendData(coinData.id);

  if (!isBackTriggered) helper.toggleModalWindow('send-coin-form', 300);
  // btn close
  $('.send-coin-form .btn-close,.send-coin-form .modal-overlay').click(function() {
    helper.toggleModalWindow('send-coin-form', 300);
  });
  // btn next
  $('.send-coin-form .btn-next').click(function() {
    // copy send coin data entered by a user
    sendFormDataCopy = { address: $('.modal-send-coin .tx-address').val(),
                         amount: $('.modal-send-coin .tx-amount').val(),
                         amountCurrency: $('.modal-send-coin .tx-amount-currency').val(),
                         fee: $('.modal-send-coin .tx-fee').val(),
                         feeCurrency: $('.modal-send-coin .tx-fee-currency').val(),
                         note: $('.modal-send-coin .tx-note').val() };

    sendCoinModalConfirm();
  });
}

function sendCoinModalConfirm() {
  if (validateSendCoinForm()) {
    var templateToLoad = sendCoinConfirmationTemplate,
        activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
        coinData = getCoinData(activeCoin),
        activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
        activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html()),
        txAddress = $('.send-coin-form .tx-address').val(),
        txAmount = $('.send-coin-form .tx-amount').val(),
        txAmountCurrency = $('.send-coin-form .tx-amount-currency').val(),
        txFee = $('.send-coin-form .tx-fee').val(),
        txFeeCurrency = $('.send-coin-form .tx-fee-currency').val(),
        txNote = $('.send-coin-form .tx-note').val();

    // prep template
    templateToLoad = templateToLoad.
                     replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                     replace('{{ coin_name }}', coinData.name).
                     replace(/{{ currency }}/g, defaultCurrency).
                     replace('{{ coin_value }}', activeCoinBalanceCoin).
                     replace('{{ currency_value }}', activeCoinBalanceCurrency).
                     replace('{{ tx_coin_address }}', txAddress).
                     replace('{{ tx_coin_amount }}', txAmount).
                     replace('{{ tx_coin_amount_currency }}', txAmountCurrency).
                     replace(/{{ tx_coin_fee_value }}/g, txFee).
                     replace('{{ tx_coin_fee_currency }}', txFeeCurrency).
                     replace('{{ tx_note }}', txNote).
                     replace('{{ tx_total }}', txAmount /*Number(txAmount) + Number(txFee)*/);

    $('.modal-send-coin').html(templateToLoad);

    // btn back
    $('.send-coin-form .btn-back').click(function() {
      sendCoinModalInit(true);
    });

    $('.btn-confirm-tx').click(function() {
      var api = new apiProto(),
          helper = new helperProto(),
          txDataToSend = { address: txAddress, amount: txAmount, note: txNote };

      // TODO: ugly, rewrite
      $('.modal-append-container').html(addCoinPassphraseTemplate.
                                        replace('login-form-modal', 'send-coin-confirm-passphrase').
                                        replace('>Add<', '>Ok<').
                                        replace('Add a wallet', 'Wallet passphrase').
                                        replace('to add wallet', 'to confirm transaction'));

      helper.toggleModalWindow('send-coin-confirm-passphrase', 300);

      if (dev.isDev && dev.coinPW.coind[coinData.id]) {
        $('.send-coin-confirm-passphrase #passphrase').val(dev.coinPW.coind[coinData.id]);
        $('.send-coin-confirm-passphrase .btn-add-wallet').removeClass('disabled');
      } else {
        $('.login-form-modal #passphrase').val('');
        $('.send-coin-confirm-passphrase .btn-add-wallet').addClass('disabled');
      }

      $('.send-coin-confirm-passphrase .btn-close,.send-coin-confirm-passphrase .modal-overlay').click(function() {
        helper.toggleModalWindow('send-coin-confirm-passphrase', 300);
      });

      $('.send-coin-confirm-passphrase .btn-add-wallet').click(function() {
        var coindWalletLogin = api.walletLogin($('.send-coin-confirm-passphrase #passphrase').val(), settings.defaultWalletUnlockPeriod, coinData.id),
            setTxFeeResult = false;

        if (coindWalletLogin !== -14) {
          helper.toggleModalWindow('send-coin-confirm-passphrase', 300);

          if (Number(sendFormDataCopy.fee) !== Number(coinsInfo[coinData.id].relayFee) && Number(sendFormDataCopy.fee) !== 0.00001 && Number(sendFormDataCopy.fee) !== 0) {
            setTxFeeResult = api.setTxFee(coinData.id, sendFormDataCopy.fee);
          }

          var sendTxResult = api.sendToAddress(coinData.id, txDataToSend);

          if (sendTxResult.length === 64) {
            // go to success step
            $('.send-coin-form .rs_modal').addClass('blur');
            $('.send-coin-form .send-coin-success-overlay').removeClass('hidden');

            $('.send-coin-form .btn-confirmed').click(function() {
              helper.toggleModalWindow('send-coin-form', 300);
            });
          } else {
            // go to an error step
            helper.prepMessageModal('Transaction was not send due to an error!', 'red', true);
          }

          // revert pay fee
          if (setTxFeeResult) api.setTxFee(coinData.id, 0);
        } else {
          helper.prepMessageModal('Incorrect passphrase. Try again.', 'red', true);
        }
      });
    });
  }
}

/*
  TODO: 1) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
        1a) address byte prefix check
*/
function validateSendCoinForm() {
  var isValid = false,
      activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
      coinData = getCoinData(activeCoin),
      activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
      activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html());

  // address
  if ($('.tx-address').val().length !== 34) {
    $('.tx-address').addClass('validation-field-error');
    $('.tx-address-validation').html('Incorrect address. Please, make sure you enter it right.');
    $('.tx-address-validation').addClass('col-red');
  } else {
    $('.tx-address').removeClass('validation-field-error');
    $('.tx-address-validation').html('Enter a wallet address');
    $('.tx-address-validation').removeClass('col-red');
  }
  // coin amount
  if (Number($('.tx-amount').val()) === 0 || !$('.tx-amount').val().length || $('.tx-amount').val() > activeCoinBalanceCoin) {
    $('.tx-amount').addClass('validation-field-error');
    $('.tx-amount-validation').html(Number($('.tx-amount').val()) === 0 || !$('.tx-amount').val().length ? 'Please enter an amount.' : 'Not enough money. Max. ' + activeCoinBalanceCoin + ' ' + $('.account-coins-repeater .item.active').attr('data-coin-id').toUpperCase());
    $('.tx-amount-validation').addClass('col-red');
  } else {
    $('.tx-amount').removeClass('validation-field-error');
    $('.tx-amount-validation').html('Enter in ' + $('.account-coins-repeater .item.active').attr('data-coin-id').toUpperCase() + ' or ' + defaultCurrency.toUpperCase());
    $('.tx-amount-validation').removeClass('col-red');
  }
  // fee
  if ((Number($('.tx-fee').val()) + Number($('.tx-amount').val())) > activeCoinBalanceCoin) {
    $('.tx-fee').addClass('validation-field-error');
    $('.tx-fee-validation').html((activeCoinBalanceCoin - Number($('.tx-amount').val())) > 0 ? 'Fee cannot exceed ' + (activeCoinBalanceCoin - Number($('.tx-amount').val())) : 'Total amount to send exceeds ' + activeCoinBalanceCoin);
    $('.tx-fee-validation').addClass('col-red');
  }
  if (Number($('.tx-fee').val()) < (coinsInfo[coinData.id].relayFee || 0.00001)) {
    $('.tx-fee').addClass('validation-field-error');
    $('.tx-fee-validation').html((coinsInfo[coinData.id].relayFee || 0.00001) + ' is a min. required fee.');
    $('.tx-fee-validation').addClass('col-red');
  }
  if ((Number($('.tx-fee').val()) >= (coinsInfo[coinData.id].relayFee || 0.00001)) && (Number($('.tx-fee').val()) + Number($('.tx-amount').val())) < activeCoinBalanceCoin)  {
    $('.tx-fee').removeClass('validation-field-error');
    $('.tx-fee-validation').html('Minimum fee. Increase it to speed up transaction.');
    $('.tx-fee-validation').removeClass('col-red');
  }

  if ($('.tx-address').val().length !== 34 ||
      Number($('.tx-amount').val()) === 0 ||
      !$('.tx-amount').val().length ||
      $('.tx-amount').val() > activeCoinBalanceCoin ||
      Number($('.tx-fee').val() + $('.tx-amount').val()) > activeCoinBalanceCoin) {
    isValid = false;
  } else {
    isValid = true;
  }

  return isValid;
}