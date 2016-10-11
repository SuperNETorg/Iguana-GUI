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

  // load templates
  $('body').append(addCoinModalTemplate);
  $('body').append(addCoinPassphraseTemplate);
  $('body').append(receiveCoinTemplate);

  if (!isIguana) $('.btn-add-coin').html('Add wallet');

  // coin is auto detected based on available portp2p
  if (activeCoin) defaultCoin = activeCoin.toUpperCase();

  if (session.checkSession(true)) {
    $('.dashboard').removeClass('hidden');
    updateRates(null, null, null, true);
    constructAccountCoinRepeater();
    //$('.transactions-list-repeater').html(constructTransactionUnitRepeater());
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

  if (!isIguana && !dev.isDev) $('.lnk-logout').hide();

  $('.btn-add-coin').click(function() {
    addCoinButtonCB();
  });
  $('.btn-receive').click(function(){
  	 bindReceive();
  });

  // modals
  // add coin
  $('.add-new-coin-form .btn-close,.add-new-coin-form .modal-overlay').click(function() {
    helper.toggleModalWindow('add-new-coin-form', 300);
    coinsSelectedByUser = [];
    $('.supported-coins-repeater-inner').html(constructCoinRepeater());
    bindClickInCoinRepeater();
  });
  // add coin passphrase
  $('.login-form-modal .btn-close,.login-form-modal .modal-overlay').click(function() {
    helper.toggleModalWindow('login-form-modal', 300);
  });
  $('#passphrase').keyup(function() {
    if ($('#passphrase').val().length > 0) {
      $('.btn-add-wallet').removeClass('disabled');
    } else {
      $('.btn-add-wallet').addClass('disabled');
    }
  });
  $('.btn-add-wallet').click(function() {
    authAllAvailableCoind();
  });

  $('.btn-next').click(function() {
    var result = false;

    // coind
    coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
    helper.toggleModalWindow('login-form-modal', 300);

    if (dev.isDev && dev.coinPW.coind[coinsSelectedToAdd[0]]) {
      $('.login-form-modal #passphrase').val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
      $('.btn-add-wallet').removeClass('disabled');
    } else {
      $('.login-form-modal #passphrase').val('');
      $('.btn-add-wallet').addClass('disabled');
    }

    // iguana multi-coin, don't remove
    // TODO: async, refactor
    // prompt walletpassphrase to add coind
    /*for (var key in coinsSelectedToAdd) {
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
          localStorage.setVal('iguana-' + coinsSelectedToAdd[key] + '-passphrase', { 'logged': 'yes' });
          coinsInfo[coinsSelectedToAdd[key]].connection = true;
          result = true;
        }
      }
    }*/

    // TODO: dom update
    //if (result) constructAccountCoinRepeater();
  });

  bindCoinRepeaterSearch();
}