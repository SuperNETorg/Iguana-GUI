/*!
 * Iguana dashboard/init
 *
 */

function initDashboard() {
  var session = new helperProto(),
      helper = new helperProto(),
      api = new apiProto(),
      localStorage = new localStorageProto();

  if (localStorage.getVal('iguana-active-coin') && localStorage.getVal('iguana-active-coin').id) activeCoin = localStorage.getVal('iguana-active-coin').id;

  defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;
  defaultCurrency = helper.getCurrency() ? helper.getCurrency().name : settings.defaultCurrency;

  // load templates
  if (!isIguana) {
    addCoinModalTemplate = addCoinModalTemplate.replace('Adding a new coin', 'Adding a new wallet');
    addCoinModalTemplate = addCoinModalTemplate.replace('Select coins to add', 'Select a wallet to add');
  }

  $('body').append(addCoinModalTemplate);
  $('body').append(addCoinPassphraseTemplate);
  $('body').append(receiveCoinTemplate);

  // message modal
  helper.initMessageModal();
  helper.prepMessageModal('Address is copied to clipboard', 'blue');

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

  //if (!isIguana && !dev.isDev) $('.lnk-logout').hide();

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
      $('.login-form-modal .btn-add-wallet').removeClass('disabled');
    } else {
      $('.login-form-modal .btn-add-wallet').addClass('disabled');
    }
  });
  $('.login-form-modal .btn-add-wallet').click(function() {
    authAllAvailableCoind();
  });

  $('.btn-next').click(function() {
    var result = false;

    // coind
    coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
    helper.toggleModalWindow('login-form-modal', 300);

    if (dev.isDev && dev.coinPW.coind[coinsSelectedToAdd[0]]) {
      $('.login-form-modal #passphrase').val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
      $('.login-form-modal .btn-add-wallet').removeClass('disabled');
    } else {
      $('.login-form-modal #passphrase').val('');
      $('.login-form-modal .btn-add-wallet').addClass('disabled');
    }
  });

  bindCoinRepeaterSearch();
}