/*!
 * Iguana dashboard/send-to-address
 *
 */

var sendFormDataCopy = {};

function sendCoinModalInit(isBackTriggered) {
  var templateToLoad = templates.all.sendCoinEntry,
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

  var modalSendCoinClass = '.modal-send-coin';
  $(modalSendCoinClass).html(templateToLoad);

  if (!currentCoinRate) {
    $(modalSendCoinClass + ' .tx-amount-currency').val(0);
    $(modalSendCoinClass + ' .tx-fee-currency').val(0);
    $(modalSendCoinClass + ' .tx-amount-currency').attr('disabled', true);
    $(modalSendCoinClass + ' .tx-fee-currency').attr('disabled', true);
  }

  // ref: http://jsfiddle.net/dinopasic/a3dw74sz/
  // allow numeric only entry
  $(modalSendCoinClass + ' .tx-amount,' + modalSendCoinClass + ' .tx-amount-currency,' + modalSendCoinClass + ' .tx-fee,' + modalSendCoinClass + ' .tx-fee-currency').keypress(function (event) {
    var inputCode = event.which,
        currentValue = $(this).val();
    if (inputCode > 0 && (inputCode < 48 || inputCode > 57)) {
      if (inputCode == 46) {
        if (helper.getCursorPositionInputElement($(this)) == 0 && currentValue.charAt(0) == '-') return false;
        if (currentValue.match(/[.]/)) return false;
      }
      else if (inputCode == 45) {
        if (currentValue.charAt(0) == '-') return false;
        if (helper.getCursorPositionInputElement($(this)) != 0) return false;
      }
      else if (inputCode == 8) return true;
      else return false;
    }
    else if (inputCode > 0 && (inputCode >= 48 && inputCode <= 57)) {
      if (currentValue.charAt(0) == '-' && helper.getCursorPositionInputElement($(this)) == 0) return false;
    }
  });

  // calc on keying
  $(modalSendCoinClass + ' .tx-amount,' +
    modalSendCoinClass + ' .tx-amount-currency,' +
    modalSendCoinClass + ' .tx-fee,' +
    modalSendCoinClass + ' .tx-fee-currency').keydown(function(e) {
      var keyCode = e.keyCode || e.which;

      if (keyCode === 189 || keyCode === 173 || keyCode === 109) { // disable "-" entry
        e.preventDefault();
      }
  });
  $(modalSendCoinClass + ' .tx-amount').keyup(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-amount', true, $(this).val());
  });
  $(modalSendCoinClass + ' .tx-amount-currency').keyup(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-amount', false);
  });
  $(modalSendCoinClass + ' .tx-fee').keyup(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-fee', true);
  });
  $(modalSendCoinClass + ' .tx-fee-currency').keyup(function(e) {
    txAmountFeeKeyupEvent(e, 'tx-fee', false);
  });

  function txAmountFeeKeyupEvent(evt, fieldName, type, val) {
    var keyCode = evt.keyCode || evt.which;

    if (keyCode !== 9) {
      currentCoinRate = updateRates(coinData.id, defaultCurrency, true);

      var modalSendCoinField = modalSendCoinClass + ' .' + fieldName;
      if (type) {
        var fielValue = $(modalSendCoinField).val() * currentCoinRate;
        $(modalSendCoinField + '-currency').val(fielValue.toFixed(helper.decimalPlacesFormat(fielValue).coin));
      } else {
        var fieldValue = $(modalSendCoinField + '-currency').val() / currentCoinRate;
        $(modalSendCoinField).val(fieldValue.toFixed(helper.decimalPlacesFormat(fieldValue).coin));
      }
    } else {
      evt.preventDefault();
    }
  }

  // dev
   if (dev.isDev) loadTestSendData(coinData.id);

  var sendCoinParentClass = '.send-coin-form';
  if (!isBackTriggered) helper.toggleModalWindow(sendCoinParentClass.replace('.', ''), 300);
  // btn close
  $(sendCoinParentClass + ' .btn-close,' + sendCoinParentClass + ' .modal-overlay').click(function() {
    helper.toggleModalWindow(sendCoinParentClass.replace('.', ''), 300);
  });
  // btn next
  $(modalSendCoinClass + ' .btn-next').click(function() {
    // copy send coin data entered by a user
    sendFormDataCopy = { address: $(modalSendCoinClass + ' .tx-address').val(),
                         amount: $(modalSendCoinClass + ' .tx-amount').val(),
                         amountCurrency: $(modalSendCoinClass + ' .tx-amount-currency').val(),
                         fee: $(modalSendCoinClass + ' .tx-fee').val(),
                         feeCurrency: $(modalSendCoinClass + ' .tx-fee-currency').val(),
                         note: $(modalSendCoinClass + ' .tx-note').val() };

    sendCoinModalConfirm();
  });
}

function sendCoinModalConfirm() {
  if (validateSendCoinForm()) {
    var templateToLoad = templates.all.sendCoinConfirmation,
        sendCoinFormClass = '.send-coin-form';
        accountCoinsRepeaterActive = '.account-coins-repeater .item.active';
        activeCoin = $(accountCoinsRepeaterActive).attr('data-coin-id'),
        coinData = getCoinData(activeCoin),
        activeCoinBalanceCoin = Number($(accountCoinsRepeaterActive + ' .balance .coin-value .val').html()),
        activeCoinBalanceCurrency = Number($(accountCoinsRepeaterActive + ' .balance .currency-value .val').html()),
        txAddress = $(sendCoinFormClass + ' .tx-address').val(),
        txAmount = $(sendCoinFormClass + ' .tx-amount').val(),
        txAmountCurrency = $(sendCoinFormClass + ' .tx-amount-currency').val(),
        txFee = $(sendCoinFormClass + ' .tx-fee').val(),
        txFeeCurrency = $(sendCoinFormClass + ' .tx-fee-currency').val(),
        txNote = $(sendCoinFormClass + ' .tx-note').val();

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
    $(sendCoinFormClass + ' .btn-back').click(function() {
      sendCoinModalInit(true);
    });

    $('.btn-confirm-tx').click(function() {
      var txDataToSend = { address: txAddress,
                           amount: txAmount,
                           note: txNote };

      if (!isIguana) {
        var sendConfirmPassphraseClass = '.send-coin-confirm-passphrase'
            passphraseElement = '#passphrase',
            disabledClassName = 'disabled';
        // TODO: ugly, rewrite
        $('.modal-append-container').html(templates.all.sendCoinPassphrase.
                                          replace('login-form-modal', 'send-coin-confirm-passphrase').
                                          replace('>Add<', '>Ok<').
                                          replace('Add a wallet', 'Wallet passphrase').
                                          replace('to add wallet', 'to confirm transaction'));

        helper.toggleModalWindow('send-coin-confirm-passphrase', 300);

        if (dev.isDev && dev.coinPW.coind[coinData.id]) {
          $(sendConfirmPassphraseClass + ' ' + passphraseElement).val(dev.coinPW.coind[coinData.id]);
          $(sendConfirmPassphraseClass + ' .btn-add-wallet').removeClass(disabledClassName);
        } else {
          $('.login-form-modal ' + passphraseElement).val('');
          $(sendConfirmPassphraseClass + ' .btn-add-wallet').addClass(disabledClassName);
        }

        $(sendConfirmPassphraseClass + ' .btn-close,' + sendConfirmPassphraseClass + ' .modal-overlay').click(function() {
          helper.toggleModalWindow(sendConfirmPassphraseClass.replace('.', ''), 300);
        });

        $(sendConfirmPassphraseClass + ' .btn-add-wallet').click(function() {
          var coindWalletLogin = api.walletLogin($(sendConfirmPassphraseClass + ' ' + passphraseElement).val(), settings.defaultWalletUnlockPeriod, coinData.id);

          if (coindWalletLogin !== -14) {
            helper.toggleModalWindow(sendConfirmPassphraseClass.replace('.', ''), 300);
            execSendCoinCall();
          } else {
            helper.prepMessageModal(helper.lang('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
          }
        });
      } else {
        execSendCoinCall();
      }

      function execSendCoinCall() {
        var setTxFeeResult = false;

        if (Number(sendFormDataCopy.fee) !== Number(coinsInfo[coinData.id].relayFee) && Number(sendFormDataCopy.fee) !== 0.00001 && Number(sendFormDataCopy.fee) !== 0) {
          setTxFeeResult = api.setTxFee(coinData.id, sendFormDataCopy.fee);
        }

        var sendTxResult = api.sendToAddress(coinData.id, txDataToSend);

        if (sendTxResult.length === 64) {
          // go to success step
          $(sendCoinFormClass + ' .rs_modal').addClass('blur');
          $(sendCoinFormClass + ' .send-coin-success-overlay').removeClass('hidden');

          $(sendCoinFormClass + ' .btn-confirmed').click(function() {
            helper.toggleModalWindow(sendCoinFormClass.replace('.', ''), 300);
          });
        } else {
          // go to an error step
          helper.prepMessageModal(helper.lang('MESSAGE.TRANSACTION_ERROR'), 'red', true);
        }

        // revert pay fee
        if (setTxFeeResult) api.setTxFee(coinData.id, 0);
      }
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
      activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html()),
      txAddressVal = $('.tx-address').val(),
      txAmountVal = $('.tx-amount').val(),
      txFeeVal = $('.tx-fee').val(),
      errorClassName = 'validation-field-error', // TODO: rename error class names
      errorClassName2 = 'col-red';

  // address
  var txAddressObj = $('.tx-address'),
      txAddressValidation = $('.tx-address-validation');
  if (txAddressVal.length !== 34) {
    txAddressObj.addClass(errorClassName);
    txAddressValidation.html(helper.lang('SEND.INCORRECT_ADDRESS')).
                        addClass(errorClassName2);
  } else {
    txAddressObj.removeClass(errorClassName);
    txAddressValidation.html(helper.lang('SEND.ENTER_A_WALLET_ADDRESS')).
                        removeClass(errorClassName2);
  }
  // coin amount
  var txAmountObj = $('.tx-amount'),
      txAmountCurrencyObj = $('.tx-amount-currency'),
      txAmountValidation = $('.tx-amount-validation'),
      coinName = $('.account-coins-repeater .item.active').attr('data-coin-id').toUpperCase();
  if (Number(txAmountVal) === 0 || !txAmountVal.length || txAmountVal > activeCoinBalanceCoin) {
    txAmountObj.addClass(errorClassName);
    txAmountCurrencyObj.addClass(errorClassName);
    txAmountValidation.html(Number(txAmountVal) === 0 || !txAmountVal.length ? helper.lang('SEND.PLEASE_ENTER_AN_AMOUNT') : helper.lang('SEND.NOT_ENOUGH_MONEY') + ' ' + activeCoinBalanceCoin + ' ' + coinName).
                       addClass(errorClassName2);
  } else {
    txAmountObj.removeClass(errorClassName);
    txAmountCurrencyObj.removeClass(errorClassName);
    txAmountValidation.html(helper.lang('RECEIVE.ENTER_IN') + ' ' + coinName + ' ' + helper.lang('LOGIN.OR') + ' ' + defaultCurrency.toUpperCase()).
                       removeClass(errorClassName2);
  }
  // fee
  var txFeeObj = $('.tx-fee'),
      txFeeCurrencyObj = $('.tx-fee-currency'),
      txFeeValidation = $('.tx-fee-validation');
  if ((Number(txFeeVal) + Number(txAmountVal)) > activeCoinBalanceCoin) {
    txFeeObj.addClass(errorClassName);
    txFeeCurrencyObj.addClass(errorClassName);
    txFeeValidation.html((activeCoinBalanceCoin - Number(txAmountVal)) > 0 ? helper.lang('SEND.FEE_CANNOT_EXCEED') + ' ' + (activeCoinBalanceCoin - Number(txAmountVal)) : helper.lang('SEND.TOTAL_AMOUNT_CANNOT_EXCEED') + ' ' + activeCoinBalanceCoin).
                    addClass(errorClassName2);
  }
  if (Number(txFeeVal) < (coinsInfo[coinData.id].relayFee || 0.00001)) { // TODO: settings
    txFeeObj.addClass(errorClassName);
    txFeeCurrencyObj.addClass(errorClassName);
    txFeeValidation.html((coinsInfo[coinData.id].relayFee || 0.00001) + ' ' + helper.lang('SEND.IS_A_MIN_REQUIRED_FEE')).
                    addClass(errorClassName2);
  }
  if ((Number(txFeeVal) >= (coinsInfo[coinData.id].relayFee || 0.00001)) && (Number(txFeeVal) + Number(txAmountVal)) < activeCoinBalanceCoin)  {
    txFeeObj.removeClass(errorClassName);
    txFeeCurrencyObj.removeClass(errorClassName);
    txFeeValidation.html(helper.lang('SEND.MINIMUM_FEE')).
                    removeClass(errorClassName2);
  }

  if (txAddressVal.length !== 34 ||
      Number(txAmountVal) === 0 ||
      !txAmountVal.length ||
      txAmountVal > activeCoinBalanceCoin ||
      Number(txFeeVal + txAmountVal) > activeCoinBalanceCoin) {
    isValid = false;
  } else {
    isValid = true;
  }

  return isValid;
}