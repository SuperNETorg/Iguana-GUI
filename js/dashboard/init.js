/*!
 * Iguana dashboard/init
 *
 */

function initDashboard() {
  if (localstorage.getVal('iguana-active-coin') && localstorage.getVal('iguana-active-coin').id) activeCoin = localstorage.getVal('iguana-active-coin').id;

  defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;

  // load templates
  if (!isIguana) {
    addCoinModalTemplate = addCoinModalTemplate.replace('Adding a new coin', 'Adding a new wallet');
    addCoinModalTemplate = addCoinModalTemplate.replace('Select coins to add', 'Select a wallet to add');
  }

  $('body').append(addCoinModalTemplate);
  $('body').append(sendCoinPassphraseTemplate);
  $('body').append(receiveCoinTemplate);
  addCoinLoginTemplate = addCoinLoginTemplate.
                             replace('{{ modal_title }}', isIguana ? 'Add coin' : 'Add wallet').
                             replace('{{ cta_title }}', isIguana ? 'Select a coin to add' : 'Select a wallet to add').
                             replace('{{ word_count }}', isIguana ? 24 : 12).
                             replace('{{ item }}', isIguana ? 'a coin' : ' a wallet').
                             replace(/{{ visibility }}/g, isIguana ? ' hidden' : '');
  $('body').append(addCoinLoginTemplate);
  addCoinCreateWalletTemplate = addCoinCreateWalletTemplate.replace('{{ word_count }}', isIguana ? 24 : 12);
  $('body').append(addCoinCreateWalletTemplate);

  // message modal
  helper.initMessageModal();
  helper.prepMessageModal('Address is copied to clipboard', 'blue');

  if (!isIguana) $('.btn-add-coin').html('Add a wallet');
  if (activeCoin) defaultCoin = activeCoin.toUpperCase();

  $('.dashboard').removeClass('hidden');

  updateRates(null, null, null, true);
  constructAccountCoinRepeater(true);
  updateDashboardView(dashboardUpdateTimout);


  $('.top-menu .item').click(function() {
    $('.top-menu .item').each(function(index, item) {
      $(this).removeClass('active');
    });

    $(this).addClass('active');
    helper.openPage($(this).attr('data-url'));
  });

  $('.lnk-logout').click(function() {
    helper.logout();
  });

  //if (!isIguana && !dev.isDev) $('.lnk-logout').hide();

  $('.btn-add-coin').click(function() {
    if (isIguana) {
      addCoinButtonCB();
      $('.add-new-coin-form .btn-next').off();
      $('.add-new-coin-form .btn-next').click(function() {
        coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

        for (var i=0; i < coinsSelectedToAdd.length; i++) {
          if (coinsSelectedToAdd[i]) {
            (function(x) {
              setTimeout(function() {
                api.addCoin(coinsSelectedToAdd[x], addCoinDashboardCB);
              }, x === 0 ? 0 : settings.addCoinTimeout * 1000);
            })(i);
          }
        }
        console.log(coinsSelectedToAdd);
      });
    } else {
      //addCoinButtonCB();
      initAuthCB();
      coinsSelectedToAdd = [];
      $('.add-coin-login-form .login-add-coin-selection-title').html('Select a wallet to add');
      $('.add-coin-login-form #passphrase').val('');
      $('.add-coin-login-form .btn-signin').addClass('disabled');
      $('.add-coin-login-form #passphrase').keyup(function() {
        if ($('.add-coin-login-form #passphrase').val().length > 0 && helper.reindexAssocArray(coinsSelectedToAdd)[0]) {
          $('.add-coin-login-form .btn-signin').removeClass('disabled');
        } else {
          $('.add-coin-login-form .btn-signin').addClass('disabled');
        }
      });
      helper.toggleModalWindow('add-coin-login-form', 300);
    }
  });
  $('.add-coin-login-form .btn-signup').click(function() {
    if (!coinsSelectedToAdd || !coinsSelectedToAdd[0]) {
      helper.prepMessageModal('Please select a wallet!', 'blue', true);
    } else {
      $('.add-coin-create-wallet-form .verify-passphrase-form #passphrase').val('');
      $('.add-coin-create-wallet-form .verify-passphrase-form').addClass('hidden');
      $('.add-coin-create-wallet-form .create-account-form').removeClass('hidden');

      helper.toggleModalWindow('add-coin-create-wallet-form', 300);

      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

      if (coinsSelectedToAdd[0]) {
        $('.add-coin-create-wallet-form .login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + '<br/><span class=\"small\">' + coinsSelectedToAdd[0].toUpperCase() + '</span>');
      }
      initAuthCB();
      $('.add-coin-create-wallet-form .login-add-coin-selection-title').click(function() {
        addCoinButtonCB();
      });
      $('.add-coin-create-wallet-form .btn-close,.add-coin-create-wallet-form .modal-overlay').click(function() {
        helper.toggleModalWindow('add-coin-create-wallet-form', 300);
      });
      $('.add-coin-create-wallet-form .verify-passphrase-form .btn-back').off();
      $('.add-coin-create-wallet-form .verify-passphrase-form .btn-back').click(function() {
        $('.add-coin-create-wallet-form .verify-passphrase-form').addClass('hidden');
        $('.add-coin-create-wallet-form .create-account-form').removeClass('hidden');
      });
      $('.add-coin-create-wallet-form .verify-passphrase-form .btn-add-account').off();
      $('.add-coin-create-wallet-form .verify-passphrase-form .btn-add-account').click(function() {
        encryptCoindWallet('add-coin-create-wallet-form .verify-passphrase-form');
      });
    }
  });
  $('.add-coin-login-form .login-add-coin-selection-title').click(function() {
    addCoinButtonCB();

    $('.add-new-coin-form .btn-next').off();
    $('.add-new-coin-form .btn-next').click(function() {
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

      if (coinsSelectedToAdd[0]) {
        $('.add-coin-login-form .login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + '<br/><span class=\"small\">' + coinsSelectedToAdd[0].toUpperCase() + '</span>');
      }
      // coind
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
      helper.toggleModalWindow('add-new-coin-form', 300);

      if (dev.isDev && dev.coinPW.coind[coinsSelectedToAdd[0]]) {
        $('.add-coin-login-form #passphrase').val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
        $('.add-coin-login-form .btn-signin').removeClass('disabled');
      } else {
        $('.add-coin-login-form #passphrase').val('');
        $('.add-coin-login-form .btn-signin').addClass('disabled');
      }
      $('.verify-passphrase-form #passphrase').keyup(function() {
        if ($('.verify-passphrase-form #passphrase').val().length > 0) {
          $('.btn-add-account').removeClass('disabled');
        } else {
          $('.btn-btn-add-account').addClass('disabled');
        }
      });
      $('.add-coin-login-form .btn-signin').off();
      $('.add-coin-login-form .btn-signin').click(function() {
        authAllAvailableCoind('add-coin-login-form');
      });
    });
  });
  $('.btn-receive').click(function(){
  	 bindReceive();
  });
  $('.transactions-unit .btn-send').click(function() {
    sendCoinModalInit();
  });

  // modals
  // add coin
  $('.add-coin-login-form .btn-close,.add-coin-login-form .modal-overlay').click(function() {
    helper.toggleModalWindow('add-coin-login-form', 300);
    coinsSelectedToAdd = [];
    $('body').removeClass('modal-open');
  });
  // add coin selector modal
  $('.add-new-coin-form .btn-close,.add-new-coin-form .modal-overlay').click(function() {
    helper.toggleModalWindow('add-new-coin-form', 300);
    coinsSelectedToAdd = [];
    $('.supported-coins-repeater-inner').html(constructCoinRepeater());
    bindClickInCoinRepeater();
  });
  // add coin passphrase
  $('.login-form-modal .btn-close,.login-form-modal .modal-overlay').click(function() {
    helper.toggleModalWindow('login-form-modal', 300);
  });

  bindCoinRepeaterSearch();

  applyDashboardResizeFix();

  $(window).resize(function() {
    applyDashboardResizeFix();
  });
}

function addCoinDashboardCB(response, coin) {
  if (response === 'coin added' || response === 'coin already there') {
    if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coin + ' coin added<br/>');

    addCoinResponses.push({ 'coin': coin, 'response': response });
    coinsInfo[coin].connection = true; // update coins info obj prior to scheduled port poll
  }

  var addedCoinsOutput = '',
      failedCoinsOutput = '<br/>';
  for (var i=0; i < Object.keys(addCoinResponses).length; i++) {
    if (addCoinResponses[i].response === 'coin added' || addCoinResponses[i].response === 'coin already there') {
      addedCoinsOutput = addedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
      localstorage.setVal('iguana-' + addCoinResponses[i].coin + '-passphrase', { 'logged': 'yes' });
    } else {
      failedCoinsOutput = failedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
    }
  }
  if (addedCoinsOutput[addedCoinsOutput.length - 1] === ' ') {
    addedCoinsOutput = addedCoinsOutput.replace(/, $/, '');
  }
  if (failedCoinsOutput[failedCoinsOutput.length - 1] === ' ') {
    failedCoinsOutput = failedCoinsOutput.replace(/, $/, '');
  }

  helper.prepMessageModal(addedCoinsOutput + ' added.' + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' failed to add.' : ''), 'green', true);
}