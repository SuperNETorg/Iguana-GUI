/*!
 * Iguana dashboard/recevie-coin logic
 *
 */

/* TODO: add syscoin:17nqptPus3b5ktctVzNhxf6bqMGmJbqNcE?amount=0.10000000&label=123&message=123
*/

function bindReceive(){
  var result = '',
      coinValue,
      coinName,
      coinRate,
      returnValue,
      currency;
  var helper = new helperProto(),
  		api = new apiProto();
  if (!currency) currency = defaultCurrency;
  coinName = activeCoin || $('.account-coins-repeater .item.active').attr('data-coin-id');
  localrates = JSON.parse(localStorage.getItem("iguana-rates" + coinName.toUpperCase()));
  $(".coin-unit").text(coinName.toUpperCase());
  var coin = coinName;
  var address = api.getAccountAddress(coin, defaultAccount);
  // coinRate = updateRates(coin,currency,true);
  coinRate = updateRates(coin,currency,true);
  $('#qr-code').empty();
  $('#qr-code').qrcode(address);

  console.log(address.length);
  if(address.length)
  {
    // postcode.val(address.slice(0, -3)+' '+address.slice(-3));
    var splittedAddress = address.match(/.{1,4}/g).join(' ');
    $("#address").text(splittedAddress);
  }

  $(".currency-coin").on('keyup',function () {
    coinValue = $(this).find('.coin-value .val');
    var currencyCoin = $(".currency-coin").val();
    var currencyAmount = currencyCoin*coinRate;
    $(".currency").val(currencyAmount);
  });

  $('.btn-share-email').attr('href', 'mailto:?subject=Here%20is%20my%20' + supportedCoinsList[coinName].name + '%20address&body=Hello,%20here%20is%20my%20' + supportedCoinsList[coinName].name + '%20address%20' + address)
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  try {
    document.execCommand("copy");
  }
  catch(err) {
    alert(err);
  }
    $temp.remove();
}