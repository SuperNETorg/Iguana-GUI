/*!
 * Iguana dashboard/init
 *
 */

function initDashboard() {
  var session = new helperProto(),
      helper = new helperProto(),
      api = new apiProto(),
      localStorage = new localStorageProto();

  defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;
  defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;

  // coin is auto detected based on available portp2p
  if (activeCoin) defaultCoin = activeCoin.toUpperCase();

  if (session.checkSession(true)) {
    $('.dashboard').removeClass('hidden');
    $('.account-coins-repeater').html(constructAccountCoinRepeater());
    bindClickInAccountCoinRepeater();
    updateRates(null, null, null, true);
    constructTransactionUnitRepeater();
    //$('.transactions-list-repeater').html(constructTransactionUnitRepeater());
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
  $('.btn-receive').click(function(){
  	 bindReceive();
  });
  $('.btn-close,.modal-overlay').click(function() {
    helper.toggleModalWindow('add-new-coin-form', 300);
    coinsSelectedByUser = [];
    $('.supported-coins-repeater-inner').html(constructCoinRepeater());
    bindClickInCoinRepeater();
  });

  $('.btn-next').click(function() {
    var result = false;

    helper.toggleModalWindow('add-new-coin-form', 300);
    coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

    // prompt walletpassphrase to add coind
    for (var key in coinsSelectedToAdd) {
      if (!isIguana) {
        var coindPassphrasePrompt = prompt('Please enter your ' + coinsSelectedToAdd[key].toUpperCase() + ' passphrase', '');

        if (coindPassphrasePrompt < 1) {
          alert('Try again');
        } else {
          var coindWalletLogin = api.walletLogin(coindPassphrasePrompt, defaultSessionLifetime, coinsSelectedToAdd[key]);

          if (coindWalletLogin !== -14 && coindWalletLogin !== -15) {
            localStorage.setVal('iguana-' + coinsSelectedToAdd[key] + '-passphrase', { 'logged': 'yes' });
          } else {
            if (coindWalletLogin === -14) alert(coinsSelectedToAdd[key].toUpperCase() + ' wrong passphrase');
            if (coindWalletLogin === -15) alert('Please encrypt ' + coinsSelectedToAdd[key].toUpperCase() + ' wallet with a passphrase');
          }
        }
      } else {
        if (api.addCoin(coinsSelectedToAdd[key]) && $('.account-coins-repeater').html().indexOf('data-coin-id=\"' + coinsSelectedToAdd[key] + '\"') === -1) {
          if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coinsSelectedToAdd[key] + ' coin added<br/>');
          coinsInfo[coinsSelectedToAdd[key]].connection = true;
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