/*!
 * Iguana dashboard/recevie-coin logic
 *
 */

/*
  TODO(?): add syscoin:coinaddresshere?amount=0.10000000&label=123&message=123
*/

function bindReceive() {
  var coinValue,
      coinRate,
      returnValue,
      helper = new helperProto(),
  		api = new apiProto(),
      coin = activeCoin || $('.account-coins-repeater .item.active').attr('data-coin-id'),
      address = api.getAccountAddress(coin, defaultAccount);

  localrates = JSON.parse(localStorage.getItem("iguana-rates" + coin.toUpperCase()));
  $('.coin-unit').text(coin.toUpperCase());
  coinRate = updateRates(coin, defaultCurrency, true);

  if (address.length === 34) {
    var splittedAddress = address.match(/.{1,4}/g).join(' ');
    $('#address').text(splittedAddress);
  }

  $('.unit-currency').html(defaultCurrency);
  $('.enter-in-currency').html('Enter in ' + coin.toUpperCase() + ' or ' + defaultCurrency);

  $('.currency-coin').on('keyup', function () {
    coinValue = $(this).find('.coin-value .val');
    var currencyCoin = $(".currency-coin").val();
    var currencyAmount = currencyCoin * coinRate;
    $(".currency").val(currencyAmount);
  });

  // prevent negative values in input fields
  $('.receiving-coin-content .currency-input input').change(function() {
    if ($(this).val() < 0) $(this).val(0);
  });

  $('#qr-code').empty();
  $('#qr-code').qrcode(address);

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
    helper.prepMessageModal('Copy/paste is not supported in your browser! Please copy address manually.', 'red', true);
  }

  temp.remove();
}