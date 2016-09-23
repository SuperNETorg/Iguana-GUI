/*!
 * Iguana dashboard
 *
 */

 /*
  TODO: 1) force synchronous api calls on initial page loading; async on 15 sec info update e.g. rates, balances, tx list
        2) refactor rates retrieval
 */

var defaultCurrency = "",
    defaultCoin = "",
    coinToCurrencyRate = 0,
    coinsSelectedByUser = [],
    defaultAccount,
    ratesUpdateTimeout = 15, // sec
    decimalPlacesCoin = 1, // note: change decimalPlacesCoin and decimalPlacesCurrency to higher values
    decimalPlacesCurrency = 2, //   in case you have too small coin balance value e.g. 0.0001 BTC
    decimalPlacesTxUnit = 5,
    dashboardUpdateTimout = 15; // sec

var availableCoinsToAdd = [
  { id: "btc", name: "Bitcoin", color: "orange" },
  { id: "btcd", name: "Bitcoin D.", color: "breeze" },
  { id: "doge", name: "Dogecoin", color: "light-blue" },
  { id: "frk", name: "Franko", color: "yellow" },
  { id: "gmc", name: "GameCredits", color: "orange" },
  { id: "ltc", name: "Litecoin", color: "breeze" },
  { id: "mzc", name: "Mazacoin", color: "light-blue" },
  { id: "nmc", name: "Namecoin", color: "yellow" },
  { id: "sys", name: "SysCoin", color: "orange" },
  { id: "uno", name: "Unobtaium", color: "breeze" }
];

$(document).ready(function() {
  var session = new helperProto();
  var helper = new helperProto();
  defaultAccount = isIguana ? "default" : ""; // note: change to a specific account name if needed; default coind account name is empty string

  defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : "USD";

  // coin is auto detected based on available portp2p
  if (activeCoin) defaultCoin = activeCoin.toUpperCase();

  if (session.checkSession(true)) {
    $(".dashboard").removeClass("hidden");
    updateRates();
    $(".account-coins-repeater").html(constructAccountCoinRepeater());
    bindClickInAccountCoinRepeater();
    $(".transactions-list-repeater").html(constructTransactionUnitRepeater());
    updateTotalBalance();
    updateTransactionUnitBalance();
    updateDashboardView(dashboardUpdateTimout);
  } else {
    helperProto.prototype.openPage("login");
  }

  $(".top-menu .item").click(function() {
    $(".top-menu .item").each(function(index, item) {
      $(this).removeClass("active");
    });

    $(this).addClass("active");
    helperProto.prototype.openPage($(this).attr("data-url"));
  });

  $(".lnk-logout").click(function() {
    session.logout();
  });

  $(".btn-add-coin,.btn-close").click(function() {
    helper.toggleModalWindow("add-new-coin-form", 300);
    coinsSelectedByUser = [];
    $(".supported-coins-repeater").html(constructCoinRepeater());
    bindClickInCoinRepeater();
  });
  $(".btn-next").click(function() {
    helper.toggleModalWindow("add-new-coin-form", 300);
    coinsSelectedByUser = helper.reindexAssocArray(coinsSelectedByUser);
    console.log(coinsSelectedByUser);

    // prompt walletpassphrase to add coind
    for (var key in coinsSelectedByUser) {
      if (isIguana) {
        var coindPassphrasePrompt = prompt("Please enter your " + coinsSelectedByUser[key].toUpperCase() + " passphrase", "");
        if (coindPassphrasePrompt < 1) alert("Try again");
        console.log(coindPassphrasePrompt);
      }
    }

    $(".account-coins-repeater").html(constructAccountCoinRepeater());
    bindClickInAccountCoinRepeater();
    updateTotalBalance();
  });

  bindCoinRepeaterSearch();
});

var coinRepeaterTemplate = "<div class=\"coin\" data-coin-id=\"{{ coin_id }}\">" +
                              "<i class=\"icon cc {{ id }}-alt col-{{ color }}\"></i>" +
                              "<div class=\"name\">{{ name }}</div>" +
                           "</div>";

function updateRates(coin, currency, returnValue) {
  var api = new apiProto(),
      apiExternalRate,
      localStorage = new localStorageProto(),
      helper = new helperProto();

  //console.log('sec. elapsed since last rates update ' + Math.floor(helper.ratesUpdateElapsedTime()));
  if (helper.ratesUpdateElapsedTime(coin) >= ratesUpdateTimeout || !localStorage.getVal("iguana-rates-" + coin)) {
    if (!coin) coin = defaultCoin;
    if (!currency) currency = defaultCurrency;

    coinToCurrencyRate = !isIguana ? null : api.getIguanaRate(coin + "/" + currency);
    // graceful fallback
    // if iguana is not present get a quote form external source
    apiExternalRate = api.getExternalRate(coin + "/" + currency)

    if (!coinToCurrencyRate || coinToCurrencyRate === 0) {
      coinToCurrencyRate = apiExternalRate;

      if (returnValue) {
        localStorage.setVal("iguana-rates-" + coin, { "shortName" : defaultCurrency, "value": apiExternalRate, "updatedAt": Date.now() });
        return apiExternalRate;
      }
    } else {
      localStorage.setVal("iguana-rates-" + coin, { "shortName" : defaultCurrency, "value": coinToCurrencyRate, "updatedAt": Date.now() });
      return coinToCurrencyRate;
    }
  } else {
    if (!coinToCurrencyRate) coinToCurrencyRate = localStorage.getVal("iguana-rates-" + coin).value;
    return localStorage.getVal("iguana-rates-" + coin).value;
  }
  //console.log(localStorage.getVal("iguana-rates-" + coin));
}

// construct coins to add array
function constructCoinRepeater() {
  var result = "";

  for (var i=0; i < availableCoinsToAdd.length; i++) {
    result += coinRepeaterTemplate.replace("{{ id }}", availableCoinsToAdd[i].id.toUpperCase()).
                                   replace("{{ coin_id }}", availableCoinsToAdd[i].id.toLowerCase()).
                                   replace("{{ name }}", availableCoinsToAdd[i].name).
                                   replace("{{ color }}", availableCoinsToAdd[i].color);
  }

  return result;
}

var accountCoinRepeaterTemplate = "<div class=\"item{{ active }}\" data-coin-id=\"{{ coin_id }}\">" +
                                      "<div class=\"coin\">" +
                                        "<i class=\"icon cc {{ id }}-alt\"></i>" +
                                        "<span class=\"name\">{{ name }}</span>" +
                                      "</div>" +
                                      "<div class=\"balance\">" +
                                        "<div class=\"coin-value\"><span class=\"val\">{{ coin_value }}</span> {{ coin_id }}</div>" +
                                        "<div class=\"currency-value\"><span class=\"val\">{{ currency_value }}</span> {{ currency_name }}</div>" +
                                      "</div>" +
                                    "</div>";

// construct account coins array
function constructAccountCoinRepeater() {
  var result = "";
  var accountCoinRepeaterHTML = $(".account-coins-repeater").html();
  var isActiveCoinSet = accountCoinRepeaterHTML.indexOf("item active") > -1 ? true : false;

  if (!$(".account-coins-repeater .item").length) {
    coinsSelectedByUser[0] = defaultCoin.toLowerCase();
  }

  var index = 0;
  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      coinsSelectedByUser[index] = key;
      index++;
    }
  };

  for (var i=0; i < coinsSelectedByUser.length; i++) {
    //console.log(coinsSelectedByUser[i]);
    if (accountCoinRepeaterHTML.indexOf('data-coin-id="' + coinsSelectedByUser[i] + '"') === -1) {
      var coinLocalRate = coinToCurrencyRate;

      // call API
      // note(!): if coin is not added yet it will take a while iguana to enable RT relay
      // addCoin(coinsSelectedByUser[i]);
      var api = new apiProto();
      var coinBalance = api.getBalance(defaultAccount, coinsSelectedByUser[i]);
      console.log("coin balance: " + coinBalance);

      // fix for small balance values
      // temp disabled
      if (coinBalance < 1 && coinBalance > 0) {
        var coinBalanceFloat = coinBalance.toString().split(".");

        for (var a=0; a < coinBalanceFloat[1].length; a++) {
          if (Number(coinBalanceFloat[1][a]) !== 0) {
            decimalPlacesCoin = a + 1;
            decimalPlacesCurrency = a;
            break;
          }
        }
      } else {
        decimalPlacesCoin = 1;
        decimalPlacesCurrency = 2;
      }

      if (coinsSelectedByUser[i].toUpperCase() !== defaultCoin) {
        coinLocalRate = updateRates(coinsSelectedByUser[i].toUpperCase(), null, true);
      }

      var currencyCalculatedValue = coinBalance * coinLocalRate;
      if (currencyCalculatedValue < 1 && currencyCalculatedValue > 0) {
        var currencyCalculatedValueFloat = currencyCalculatedValue.toString().split(".");

        for (var a=0; a < currencyCalculatedValueFloat[1].length; a++) {
          if (Number(currencyCalculatedValueFloat[1][a]) !== 0) {
            decimalPlacesCurrency = a + 1;
            break;
          }
        }
      } else {
        decimalPlacesCurrency = 2;
      }

      console.log("rate: " + coinLocalRate + ", coinbal: " +  coinBalance + ", calc: " + currencyCalculatedValue + ", dplaces: " + decimalPlacesCurrency);

      var coinData = getCoinData(coinsSelectedByUser[i]);

      if (i === 0 && !isActiveCoinSet) activeCoin = coinData.id;
      if (coinData)
        result += accountCoinRepeaterTemplate.replace("{{ id }}", coinData.id.toUpperCase()).
                                              replace("{{ name }}", coinData.name).
                                              replace("{{ coin_id }}", coinData.id.toLowerCase()).
                                              replace("{{ coin_id }}", coinData.id.toUpperCase()).
                                              replace("{{ currency_name }}", defaultCurrency).
                                              replace("{{ coin_value }}", coinBalance ? coinBalance.toFixed(decimalPlacesCoin) : 0).
                                              replace("{{ currency_value }}", currencyCalculatedValue.toFixed(decimalPlacesCurrency)).
                                              replace("{{ active }}", i === 0 && !isActiveCoinSet ? " active" : "");
    }
  }

  return result;
}

var transactionUnitRepeater = "<div class=\"item {{ status_class }} {{ timestamp_format }}\">" +
                                "<div class=\"status\">{{ status }}</div>" +
                                "<div class=\"amount\">" +
                                  "<span class=\"in-out {{ in_out }}\"></span>" +
                                  "<span class=\"value\">{{ amount }}</span>" +
                                  "<span class=\"coin-name\">{{ coin }}</span>" +
                                "</div>" +
                                "<div class=\"progress-status\">" +
                                  "<i class=\"icon\"></i>" +
                                "</div>" +
                                "<div class=\"hash\">{{ hash }}</div>" +
                                "<div class=\"timestamp\">{{ timestamp_single }}</div>" +
                                "<div class=\"timestamp two-lines\">" +
                                  "<div class=\"timestamp-date\">{{ timestamp_date }}</div>" +
                                  "<div class=\"timestamp-time\">{{ timestamp_time }}</div>" +
                                "</div>" +
                              "</div>";

// construct transaction unit array
// TODO: add edge case "no transactions" for a selected coin
function constructTransactionUnitRepeater() {
  var result = "",
      helper = new helperProto(),
      api = new apiProto(),
      coinName = activeCoin || $(".account-coins-repeater .item.active");
      //selectedCoin = activeCoin || $(".account-coins-repeater .item.active");

  // reload page until server responds with normal timeout
  //if (selectedCoin.length === 0 || !selectedCoin.length) {
    //console.log("something is wrong, reload page in 4 sec");
    /*setTimeout(function() {
      location.reload();
    }, 4000);*/
  /*} else {
    coinName = selectedCoin.attr("data-coin-id").toUpperCase();
  }*/

  //alert(coinName);
  var transactionsList = api.listTransactions(defaultAccount, coinName.toLowerCase());
  // sort tx in desc order by timestamp
  // iguana transactionslist method is missing timestamp field in response, straight forward sorting cannot be done
  if (transactionsList[0])
    if (transactionsList[0].time) transactionsList.sort(function(a, b) { return b.time - a.time });
    if (transactionsList[0].blocktime) transactionsList.sort(function(a, b) { return b.blocktime - a.blocktime });

  for (var i=0; i < transactionsList.length; i++) {
    if (transactionsList[i].txid) {
      // TODO: add func to evaluate tx time in seconds/minutes/hours/a day from now e.g. "a moment ago", "1 day ago" etc
      // timestamp is converted to 24h format
      var transactionDetails = api.getTransaction(transactionsList[i].txid),
          txIncomeOrExpenseFlag = "",
          txStatus = "N/A",
          txCategory = "",
          txAddress = "",
          txAmount = "N/A";

      if (transactionDetails)
        if (transactionDetails.details) {
          txAddress = transactionDetails.details[0].address;
          txAmount = Math.abs(transactionDetails.details[0].amount);
          // non-iguana
          if (transactionDetails.details[0].category)
            txCategory = transactionDetails.details[0].category;

            if (transactionDetails.details[0].category === "send") {
              txIncomeOrExpenseFlag = "bi_interface-minus";
              txStatus = "sent";
            } else {
              txIncomeOrExpenseFlag = "bi_interface-plus";
              txStatus = "received";
            }
        } else {
          // iguana
          txAddress = transactionsList[i].address || transactionDetails.address;
          txAmount = transactionsList[i].amount;
          txStatus = transactionDetails.category || transactionsList[i].category;
          txCategory = transactionDetails.category || transactionsList[i].category;

          if (txStatus === "send") {
            txIncomeOrExpenseFlag = "bi_interface-minus";
            txStatus = "sent";
          } else {
            txIncomeOrExpenseFlag = "bi_interface-plus";
            txStatus = "received";
          }
        }

      if (transactionDetails && txStatus !== "N/A") {
        //console.log(transactionDetails);
        result += transactionUnitRepeater.replace("{{ status }}", txStatus).
                                          replace("{{ status_class }}", txCategory).
                                          replace("{{ in_out }}", txIncomeOrExpenseFlag).
                                          replace("{{ amount }}", txAmount.toFixed(decimalPlacesTxUnit)).
                                          replace("{{ timestamp_format }}", "timestamp-multi").
                                          replace("{{ coin }}", coinName.toUpperCase()).
                                          replace("{{ hash }}", txAddress !== undefined ? txAddress : "N/A").
                                          replace("{{ timestamp_date }}", helper.convertUnixTime(transactionDetails.blocktime || transactionDetails.timestamp || transactionDetails.time, "DDMMMYYYY")).
                                          replace("{{ timestamp_time }}", helper.convertUnixTime(transactionDetails.blocktime || transactionDetails.timestamp || transactionDetails.time, "HHMM"));
      }
    }
  }
  /*if (coinName === undefined && transactionsList.length) {
    result = "<strong>Connection failure. The page will reload automatically in 4 seconds.</strong>";
  }*/
  return result;
}

function updateTotalBalance() {
  var totalBalance = 0;

  $(".account-coins-repeater .item").each(function(index, item) {
    var coin = $(this).attr("data-coin-id");
    var coinValue = $(this).find(".coin-value .val");
    var currencyValue = $(this).find(".currency-value .val");

    totalBalance += Number(coinValue.html()) * updateRates(coin.toUpperCase(), null, true);
  });

  $(".balance-block .balance .value").html(totalBalance.toFixed(decimalPlacesCurrency));
  $(".balance-block .balance .currency").html(defaultCurrency);
}

function updateTransactionUnitBalance(isAuto) {
  var selectedCoin = $(".account-coins-repeater .item.active");
  var currentCoinRate = isAuto ? updateRates(selectedCoin.attr("data-coin-id").toUpperCase()) : parseFloat($(".account-coins-repeater .item.active .currency-value .val").html()) / parseFloat($(".account-coins-repeater .item.active .coin-value .val").html(), null, true);
  var selectedCoinValue = Number($(".account-coins-repeater .item.active .coin-value .val").html()) ? Number($(".account-coins-repeater .item.active .coin-value .val").html()) : 0;
  var curencyValue = (selectedCoinValue * currentCoinRate).toFixed(decimalPlacesCurrency);

  if (selectedCoin.length !== 0) {
    $(".transactions-unit .active-coin-balance .value").html(selectedCoinValue.toFixed(decimalPlacesCoin));
    $(".transactions-unit .active-coin-balance .coin-name").html(selectedCoin.attr("data-coin-id").toUpperCase());
    $(".transactions-unit .active-coin-balance-currency .value").html(curencyValue !== "NaN" ? curencyValue : (0.00).toFixed(decimalPlacesCurrency));
    $(".transactions-unit .active-coin-balance-currency .currency").html(defaultCurrency.toUpperCase());
  }
}

function updateAccountCoinRepeater() {
  $(".account-coins-repeater .item").each(function(index, item) {
    var coin = $(this).attr("data-coin-id");
    var coinValue = $(this).find(".coin-value .val");
    var currencyValue = $(this).find(".currency-value .val");
    var currenyValueCalculated = (Number(coinValue.html()) * updateRates(coin.toUpperCase(), null, true)).toFixed(decimalPlacesCurrency);

    currencyValue.html(Number(currenyValueCalculated) ? currenyValueCalculated : 0);
  });
}

function updateDashboardView(timeout) {
  var helper = new helperProto();

  var dashboardUpdateTimer = setInterval(function() {
    if (!isRT) apiProto.prototype.testCoinPorts();

    //console.clear();
    helper.checkSession();
    updateRates();
    updateTotalBalance();
    updateAccountCoinRepeater();
    updateTransactionUnitBalance(true);
    $(".transactions-list-repeater").html(constructTransactionUnitRepeater());
    console.log("dashboard updated");
  }, timeout * 1000);
}

function getCoinData(coinId) {
  for (var i=0; i < availableCoinsToAdd.length; i++) {
    if (availableCoinsToAdd[i].id.toString() === coinId.toString())
      return availableCoinsToAdd[i];
  }

  return false;
}

function bindClickInAccountCoinRepeater() {
  $(".account-coins-repeater .item").each(function(index, item) {
    $(this).click(function() {
      $(".account-coins-repeater .item").filter(":visible").removeClass("active");
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
      } else {
        $(this).addClass("active");
        activeCoin = $(this).attr("data-coin-id");
        updateTransactionUnitBalance();
        constructTransactionUnitRepeater();
        $(".transactions-list-repeater").html(constructTransactionUnitRepeater());
      }
    });
  });
}

function bindClickInCoinRepeater() {
  $(".supported-coins-repeater .coin").each(function(index, item) {
    $(this).click(function() {
      if ($(this).hasClass("active")) {
        delete coinsSelectedByUser[index];
        $(this).removeClass("active");
      } else {
        $(this).addClass("active");
        coinsSelectedByUser[index] = $(this).attr("data-coin-id");
      }
    });
  });
}

function bindCoinRepeaterSearch() {
  $(".quick-search .input").keyup(function() {
    var quickSearchVal = $(this).val().toLowerCase();

    $(".supported-coins-repeater .coin .name").each(function(index, item) {
      var itemText = $(item).text().toString().toLowerCase();

      if (itemText.indexOf(quickSearchVal) > -1)
        $(this).parent().removeClass("fade");
      else
        $(this).parent().addClass("fade");
    });

    // fade in elements if nothing was found
    if ($(".supported-coins-repeater .coin").filter(".fade").length === availableCoinsToAdd.length)
      $(".supported-coins-repeater .coin").filter(".fade").removeClass("fade");
  });
}