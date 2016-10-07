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
  coinName = activeCoin || $('.account-coins-repeater .item.active');
  localrates = JSON.parse(localStorage.getItem("iguana-rates" + coinName.toUpperCase()));  
  coinName = activeCoin || $('.account-coins-repeater .item.active');
  $(".coin-unit").text(coinName.toUpperCase())
  var coin = coinName.toUpperCase();
  var address = api.getAccountAddress();
  var coinToCurrencyRate = !isIguana ? null : api.getIguanaRate(coin + '/' + currency);
  coinRate = updateRates(coin,currency,returnValue);
  $('#qr-code').empty();
  $('#qr-code').qrcode(address);
  $("#address").text(address);
  
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