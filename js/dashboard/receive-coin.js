/*!
 * Iguana dashboard/recevie-coin logic
 *
 */

/*
  TODO(?): add syscoin:coinaddresshere?amount=0.10000000&label=123&message=123
*/

function bindReceive() {
  var coinRate,
      coin = activeCoin || $('.account-coins-repeater .item.active').attr('data-coin-id'),
      address = api.getAccountAddress(coin, defaultAccount),
      currencyCoin = $('.currency-coin'),
      currencyObj = $('.currency');

  currencyCoin.val('');
  currencyObj.val('');
  localrates = JSON.parse(localstorage.getVal("iguana-rates" + coin.toUpperCase()));
  $('.coin-unit').text(coin.toUpperCase());
  coinRate = updateRates(coin, defaultCurrency, true);

  if (address.length === 34) {
    var splittedAddress = address.match(/.{1,4}/g).join(' ');
    $('#address').text(splittedAddress);
  }

  $('.unit-currency').html(defaultCurrency);
  $('.enter-in-currency').html(helper.lang('RECEIVE.ENTER_IN') + ' ' + coin.toUpperCase() + ' ' + helper.lang('LOGIN.OR') + ' ' + defaultCurrency);

  currencyCoin.on('keyup', function () {
    var calcAmount = $(this).val() * coinRate;
    currencyObj.val(calcAmount.toFixed(helper.decimalPlacesFormat(calcAmount).currency));
  });

  currencyObj.on('keyup', function () {
    var calcAmount = $(this).val() / coinRate;
    currencyCoin.val(calcAmount.toFixed(helper.decimalPlacesFormat(calcAmount).currency));
  });

  // ref: http://jsfiddle.net/dinopasic/a3dw74sz/
  // allow numeric only entry
  var currencyInput = $('.receiving-coin-content .currency-input input');
  currencyInput.keypress(function(event) {
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
  currencyInput.keydown(function(event) {
    var keyCode = event.keyCode || event.which;

    if (keyCode === 189 || keyCode === 173 || keyCode === 109) { // disable "-" entry
      event.preventDefault();
    }
  });

  $('#qr-code').empty().qrcode(address);

  $('.btn-share-email').attr('href', 'mailto:?subject=Here%20is%20my%20' + supportedCoinsList[coin].name + '%20address' +
                                     '&body=Hello,%20here%20is%20my%20' + supportedCoinsList[coin].name + '%20address%20' + address);
}

function copyToClipboard(element) {
  var temp = $('<input>');

  $('body').append(temp);
  temp.val($(element).text()).select();

  try {
    document.execCommand("copy");
  } catch(err) {
    helper.prepMessageModal(helper.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED_ADDRESS'), 'red', true);
  }

  temp.remove();
}