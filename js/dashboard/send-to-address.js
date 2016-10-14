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
  templateToLoad = templateToLoad.replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
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

  // TODO: rewrite
  // calc
  $('.modal-send-coin .tx-amount').keyup(function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode !== 9) {
      e.preventDefault();

      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);
      $('.modal-send-coin .tx-amount-currency').val(($('.modal-send-coin .tx-amount').val() * currentCoinRate).toFixed(8));
    }
  });

  $('.modal-send-coin .tx-amount-currency').keyup(function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode !== 9) {
      e.preventDefault();
      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);
      $('.modal-send-coin .tx-amount').val(($('.modal-send-coin .tx-amount-currency').val() / currentCoinRate).toFixed(8));
    }
  });

  $('.modal-send-coin .tx-fee').keyup(function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode !== 9) {
      e.preventDefault();
      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);
      $('.modal-send-coin .tx-fee-currency').val(($('.modal-send-coin .tx-fee').val() * currentCoinRate).toFixed(8));
    }
  });

  $('.modal-send-coin .tx-fee-currency').keyup(function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9) {
      e.preventDefault();
      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);
      $('.modal-send-coin .tx-fee').val(($('.modal-send-coin .tx-fee-currency').val() / currentCoinRate).toFixed(8));
    }
  });

  // dev
  //loadTestSendData(coinData.id);

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
    templateToLoad = templateToLoad.replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
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
      $('.modal-append-container').html(addCoinPassphraseTemplate.replace('login-form-modal', 'send-coin-confirm-passphrase').
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
            helper.prepMessageModal('transaction was not send!', 'red', true);
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
  TODO: 1) add alphanum addr validation
        1a) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
        2) positive num amount & fee validation
        3) current balance check, users cannot send more than current balance amount
           including all fees
*/
function validateSendCoinForm() {
  var isValid = false,
      activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
      activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html());

  // address
  if ($('.tx-address').val().length !== 34) {
    $('.tx-address').addClass('validation-field-error');
  } else {
    $('.tx-address').removeClass('validation-field-error');
  }
  // coin amount
  if ($('.tx-amount').val() <= 0 || $('.tx-amount').val() >= activeCoinBalanceCoin) {
    $('.tx-amount').addClass('validation-field-error');
  } else {
    $('.tx-amount').removeClass('validation-field-error');
  }

  if ($('.tx-fee').val() + $('.tx-amount').val() >= activeCoinBalanceCoin) {
    $('.tx-fee').addClass('validation-field-error');
    $('.tx-amout').addClass('validation-field-error');
  } else {
    $('.tx-fee').removeClass('validation-field-error');
    $('.tx-amout').removeClass('validation-field-error');
  }

  if ($('.tx-address').val().length !== 34 || $('.tx-amount').val() <= 0) {
    isValid = false;
  } else {
    isValid = true;
  }

  return isValid;
}

// dev
var sendDataTest = { 'btcd' : { address: 'R9XTAMpr2Sm4xxUQA1g1brxPZGaTvj9xqp', val: '0.00001', note: 'gui test send to kashi\'s addr' },
                     'sys': { address: '127a42hPqaUy6zBbgfo5HHh7G9WGBQYQR4', val: '0.00001', note: 'gui test send to ed888 addr' } };

function loadTestSendData(coin) {
  $('.tx-address').val(sendDataTest[coin].address);
  $('.tx-amount').val(sendDataTest[coin].val);
  $('.tx-note').val(sendDataTest[coin].note);
}