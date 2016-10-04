/*!
 * Iguana dashboard/init
 *
 */

function initDashboard() {
  var session = new helperProto(),
      helper = new helperProto(),
      api = new apiProto(),
      localStorage = new localStorageProto();

  defaultAccount = isIguana ? 'default' : ''; // note: change to a specific account name if needed; default coind account name is empty string
  defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;

  // coin is auto detected based on available portp2p
  if (activeCoin) defaultCoin = activeCoin.toUpperCase();

  if (session.checkSession(true)) {
    $('.dashboard').removeClass('hidden');
    updateRates();
    $('.account-coins-repeater').html(constructAccountCoinRepeater());
    bindClickInAccountCoinRepeater();
    $('.transactions-list-repeater').html(constructTransactionUnitRepeater());
    updateTotalBalance();
    updateTransactionUnitBalance();
    updateDashboardView(dashboardUpdateTimout);
  } else {
    helperProto.prototype.openPage('login');
  }

  $('.top-menu .item').click(function() {
    $('.top-menu .item').each(function(index, item) {
      $(this).removeClass('active');
    });

    $(this).addClass('active');
    helperProto.prototype.openPage($(this).attr('data-url'));
  });

  $('.lnk-logout').click(function() {
    session.logout();
  });

  $('.btn-add-coin').click(function() {
    addCoinButtonCB();
  });
  $('.btn-close,.modal-overlay').click(function() {
    helper.toggleModalWindow('add-new-coin-form', 300);
    coinsSelectedByUser = [];
    $('.supported-coins-repeater').html(constructCoinRepeater());
    bindClickInCoinRepeater();
  });
  $('.btn-receive').click(function(){
  	 bindReceive();
  });
  $('.btn-next').click(function() {
    var result = false;

    helper.toggleModalWindow('add-new-coin-form', 300);
    coinsSelectedByUser = helper.reindexAssocArray(coinsSelectedByUser);
    if (dev.showConsoleMessages && dev.isDev) console.log(coinsSelectedByUser);

    // prompt walletpassphrase to add coind
    for (var key in coinsSelectedByUser) {
      if (!isIguana) {
        var coindPassphrasePrompt = prompt('Please enter your ' + coinsSelectedByUser[key].toUpperCase() + ' passphrase', '');

        if (coindPassphrasePrompt < 1) {
          alert('Try again');
        } else {
          var coindWalletLogin = api.walletLogin(coindPassphrasePrompt, defaultSessionLifetime, coinsSelectedByUser[key]);

          if (coindWalletLogin !== -14 && coindWalletLogin !== -15) {
            localStorage.setVal('iguana-' + coinsSelectedByUser[key] + '-passphrase', { 'logged': 'yes' });
          } else {
            alert(coinsSelectedByUser[key].toUpperCase() + ' wrong passphrase');
          }
        }
      } else {
        if (api.addCoin(coinsSelectedByUser[key]) && $('.account-coins-repeater').html().indexOf('data-coin-id=\"' + coinsSelectedByUser[key] + '\"') === -1) {
          if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coinsSelectedByUser[key] + ' coin added<br/>');
          coinsInfo[coinsSelectedByUser[key]].connection = true;
          result = true;
        }
      }
    }

    if (result) initDashboard();

    $('.account-coins-repeater').html(constructAccountCoinRepeater());
    bindClickInAccountCoinRepeater();
    updateTotalBalance();
  });

  bindCoinRepeaterSearch();

  // ugly workaround in iguana env
  if (isIguana)
    setInterval(function() {
      if (!$('.account-coins-repeater .coin').length) {
        apiProto.prototype.testConnection(initDashboard());
      }
    }, 2000);
}
function bindReceive()
{
  coinName = activeCoin || $('.account-coins-repeater .item.active');
  var localrates = JSON.parse(localStorage.getItem("iguana-rates-" + coinName.toUpperCase()));
  var storedNames = JSON.parse(localStorage.getItem("names"));
  var result = '',
  helper = new helperProto(),
  api = new apiProto(),
  coinName = activeCoin || $('.account-coins-repeater .item.active');
  $(".coin-unit").text(coinName.toUpperCase())
  var coin = coinName.toUpperCase();
  $.each(storedNames, function( index, value ) {
    if(index==coin)
    $("#address").text(value);
  })
  if (coinName.length) {
    var transactionsList = api.listTransactions(defaultAccount, coinName.toLowerCase());
  }
  $(".currency-coin").on('keyup',function () {
    var coinValue = $(this).find('.coin-value .val');
    var currencyCoin = $(".currency-coin").val();
    var usd = currencyCoin*localrates.value;
    $(".currency").val(usd);
  })
}