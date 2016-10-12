/*!
 * Iguana dashboard/send-to-address
 *
 */

function sendCoinModalInit(isBackTriggered) {
  var helper = new helperProto();

  var templateToLoad = sendCoinEntryTemplate,
      activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
      coinData = getCoinData(activeCoin),
      activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
      activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html());

  // prep template
  templateToLoad = templateToLoad.replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                                  replace('{{ coin_name }}', coinData.name).
                                  replace(/{{ currency }}/g, defaultCurrency).
                                  replace('{{ coin_value }}', activeCoinBalanceCoin).
                                  replace('{{ currency_value }}', activeCoinBalanceCurrency);

  $('.modal-send-coin').html(templateToLoad);

  // dev
  loadTestSendData(coinData.id);

  if (!isBackTriggered) helper.toggleModalWindow('send-coin-form', 300);
  // btn close
  $('.send-coin-form .btn-close,.send-coin-form .modal-overlay').click(function() {
    helper.toggleModalWindow('send-coin-form', 300);
  });
  // btn next
  $('.send-coin-form .btn-next').click(function() {
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
        txFee = $('.send-coin-form .tx-fee').val(),
        txNote = $('.send-coin-form .tx-note').val();

    // prep template
    templateToLoad = templateToLoad.replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                                    replace('{{ coin_name }}', coinData.name).
                                    replace(/{{ currency }}/g, defaultCurrency).
                                    replace('{{ coin_value }}', activeCoinBalanceCoin).
                                    replace('{{ currency_value }}', activeCoinBalanceCurrency).
                                    replace('{{ tx_coin_address }}', txAddress).
                                    replace('{{ tx_coin_amount }}', txAmount).
                                    replace('{{ tx_coin_amount_currency }}', 0).
                                    replace('{{ tx_coin_fee_value }}', txFee || coinsInfo[coinData.id].relayFee || 0).
                                    replace('{{ tx_coin_fee_currency }}', 0).
                                    replace('{{ tx_note }}', txNote).
                                    replace('{{ tx_total }}', txAmount);

    $('.modal-send-coin').html(templateToLoad);
    // btn back
    $('.send-coin-form .btn-back').click(function() {
      sendCoinModalInit(true);
    });
    $('.btn-confirm-tx').click(function() {

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
function validateSendCoinForm () {
  var isValid = false;

  // address
  if ($('.tx-address').val().length !== 34) {
    $('.tx-address').addClass('validation-field-error');
  } else {
    $('.tx-address').removeClass('validation-field-error');
  }
  // coin amount
  if ($('.tx-amount').val() <= 0) {
    $('.tx-amount').addClass('validation-field-error');
  } else {
    $('.tx-amount').removeClass('validation-field-error');
  }

  if ($('.tx-address').val().length !== 34 || $('.tx-amount').val() <= 0) {
    isValid = false;
  } else {
    isValid = true;
  }

  return isValid;
}

// dev
var sendDataTest = { 'btcd' : { address: 'R9XTAMpr2Sm4xxUQA1g1brxPZGaTvj9xqp', val: '0.00001', note: 'test send to kashi\'s addr' } };

function loadTestSendData(coin) {
  $('.tx-address').val(sendDataTest[coin].address);
  $('.tx-amount').val(sendDataTest[coin].val);
  $('.tx-note').val(sendDataTest[coin].note);
}