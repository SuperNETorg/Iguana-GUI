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
  var address = api.getAccountAddress(coin);
  // coinRate = updateRates(coin,currency,true);
  coinRate = updateRates(coin,currency,true);
  $('#qr-code').empty();
  $('#qr-code').qrcode(address);

  if(address.length > 3)
  {
    // postcode.val(address.slice(0, -3)+' '+address.slice(-3));
    var splittedAddress = address.match(/.{1,4}/g).join(' ');
    $("#address").text(splittedAddress);
  }

  if (coinName.length) {
    var transactionsList = api.listTransactions(defaultAccount, coinName.toLowerCase());
  }
  $(".currency-coin").on('keyup',function () {
    coinValue = $(this).find('.coin-value .val');
    var currencyCoin = $(".currency-coin").val();
    var currencyAmount = currencyCoin*coinRate;
    $(".currency").val(currencyAmount);
  })
}