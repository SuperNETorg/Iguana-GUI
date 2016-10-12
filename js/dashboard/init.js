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
  // load send coin templates
  //$('.modal-send-coin').append(sendCoinEntryTemplate);
  //$('.modal-send-coin').append(sendCoinConfirmationTemplate);

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

  $('.transactions-unit .btn-send').click(function() {
    sendCoinModalInit();
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

function sendCoinModalInit(isBackTriggered) {
  var helper = new helperProto();

  var templateToLoad = sendCoinEntryTemplate;
      activeCoin = $('.account-coins-repeater .item.active').attr('data-coin-id'),
      coinData = getCoinData(activeCoin),
      activeCoinBalanceCoin = Number($('.account-coins-repeater .item.active .balance .coin-value .val').html()),
      activeCoinBalanceCurrency = Number($('.account-coins-repeater .item.active .balance .currency-value .val').html());

  // prep template
  templateToLoad = templateToLoad.replace(/{{ coin_id }}/g, coinData.id.toUpperCase()).
                                  replace('{{ coin_name }}', coinData.name).
                                  replace(/{{ currency }}/g, defaultCurrency).
                                  replace('{{ coin_value }}', activeCoinBalanceCoin).
                                  replace('{{ currency_value }}', activeCoinBalanceCurrency);
  //$(templateToLoad).find('.coin') = //templateToLoad.replace();


  $('.modal-send-coin').html(templateToLoad);
  if (!isBackTriggered) helper.toggleModalWindow('send-coin-form', 300);
  // btn close
  $('.send-coin-form .btn-close,.send-coin-form .modal-overlay').click(function() {
    helper.toggleModalWindow('send-coin-form', 300);
  });
  // btn next
  $('.send-coin-form .btn-next').click(function() {
    sendCoinModalConfirm();
  });
}

function sendCoinModalConfirm() {
  if (verifySendCoin())
    $('.modal-send-coin').html(sendCoinConfirmationTemplate);
    // btn back
    $('.send-coin-form .btn-back').click(function() {
      sendCoinModalInit(true);
    });
}

/*
  TODO: 1) add alphanum addr validation
        1a) coin address validity check e.g. btcd address cannot be used in bitcoin send tx
        2) positive num amount & fee validation
        3) current balance check, users cannot send more than current balance amount
           including all fees
*/
function verifySendCoin () {
  var isValid = false;

  // address
  if ($('.tx-address').val().length !== 34) {
    $('.tx-address').addClass('validation-field-error');
  } else {
    $('.tx-address').removeClass('validation-field-error');
    isValid = true;
  }
  // coin amount
  if ($('.tx-amount').val() <= 0) {
    $('.tx-amount').addClass('validation-field-error');
  } else {
    $('.tx-amount').removeClass('validation-field-error');
  }

  if ($('.tx-address').val().length !== 34 || $('.tx-amount').val() <= 0) {
    isValid = false;
  } else {
    isValid = true;
  }

  return isValid;
}

/*function loadTestSendData() {
  $('.tx-address').
}*/