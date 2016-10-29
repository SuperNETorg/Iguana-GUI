/*!
 * Iguana dashboard/init
 *
 */

function initDashboard() {
  if (localstorage.getVal('iguana-active-coin') && localstorage.getVal('iguana-active-coin').id) activeCoin = localstorage.getVal('iguana-active-coin').id;

  defaultAccount = isIguana ? settings.defaultAccountNameIguana : settings.defaultAccountNameCoind;

  // load templates
  if (!isIguana) {
    addCoinModalTemplate = addCoinModalTemplate.replace(helper.lang('ADD_COIN.ADDING_A_NEW_COIN'), helper.lang('DASHBOARD.ADDING_A_NEW_WALLET')).
                                                replace(helper.lang('ADD_COIN.SELECT_COINS_TO_ADD'), helper.lang('DASHBOARD.SELECT_A_WALLET_TO_ADD'));
  }

  addCoinLoginTemplate = addCoinLoginTemplate.
                         replace('{{ modal_title }}', isIguana ? helper.lang('LOGIN.ADD_COIN') : helper.lang('LOGIN.ADD_WALLET')).
                         replace('{{ cta_title }}', isIguana ? helper.lang('ADD_COIN.SELECT_A_COIN_TO_ADD') : helper.lang('DASHBOARD.SELECT_A_WALLET_TO_ADD')).
                         replace('{{ word_count }}', isIguana ? 24 : 12).
                         replace('{{ item }}', isIguana ? ' ' + helper.lang('ADD_COIN.A_COIN') : ' ' + helper.lang('ADD_COIN.A_COIN')).
                         replace(/{{ visibility }}/g, isIguana ? ' hidden' : '');
  addCoinCreateWalletTemplate = addCoinCreateWalletTemplate.replace('{{ word_count }}', isIguana ? 24 : 12); // TODO: global

  $('body').append(addCoinModalTemplate).
            append(sendCoinPassphraseTemplate).
            append(receiveCoinTemplate).
            append(addCoinLoginTemplate).
            append(addCoinCreateWalletTemplate);

  // message modal
  helper.initMessageModal();
  helper.prepMessageModal(helper.lang('MESSAGE.ADDRESS_IS_COPIED'), 'blue');

  if (!isIguana) $('.btn-add-coin').html(helper.lang('PASSPHRASE_MODAL.ADD_A_WALLET'));
  if (activeCoin) defaultCoin = activeCoin.toUpperCase();

  $('.dashboard').removeClass('hidden');

  updateRates(null, null, null, true);
  constructAccountCoinRepeater(true);
  updateDashboardView(dashboardUpdateTimout);

  var topMenuItem = $('.top-menu .item')
      activeClassName = 'active';
  topMenuItem.click(function() {
    topMenuItem.each(function(index, item) {
      $(this).removeClass(activeClassName);
    });

    $(this).addClass(activeClassName);
    helper.openPage($(this).attr('data-url'));
  });

  $('.lnk-logout').click(function() {
    helper.logout();
  });

  //if (!isIguana && !dev.isDev) $('.lnk-logout').hide();
  var addCoinLoginClass = '.add-coin-login-form',
      addNewCoinFormClass = '.add-new-coin-form',
      loginFormClass = '.login-form-modal',
      addCoinCreateClass = '.add-coin-create-wallet-form',
      passphraseElName = '#passphrase',
      disabledClassName = 'disabled',
      hiddenClassName = 'hidden';

  $('.btn-add-coin').click(function() {
    if (isIguana) {
      addCoinButtonCB();
      var addNewCoinForm = $('.add-new-coin-form .btn-next');
      addNewCoinForm.off();
      addNewCoinForm.click(function() {
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
      });
    } else {
      //addCoinButtonCB();
      initAuthCB();
      coinsSelectedToAdd = [];
      $(addCoinLoginClass + ' .login-add-coin-selection-title').html(helper.lang('DASHBOARD.SELECT_A_WALLET_TO_ADD'));
      $(addCoinLoginClass + ' ' + passphraseElName).val('');
      $(addCoinLoginClass + ' .btn-signin').addClass(disabledClassName);
      $(addCoinLoginClass + ' ' + passphraseElName).keyup(function() {
        if ($(addCoinLoginClass + ' ' + passphraseElName).val().length > 0 && helper.reindexAssocArray(coinsSelectedToAdd)[0]) {
          $(addCoinLoginClass + ' .btn-signin').removeClass(disabledClassName);
        } else {
          $(addCoinLoginClass + ' .btn-signin').addClass(disabledClassName);
        }
      });
      helper.toggleModalWindow(addCoinLoginClass.replace('.', ''), 300);
    }
  });

  var coinSelectionShowTemplate = '<br/><span class=\"small\">{{ item }}</span>';

  $(addCoinLoginClass + '.btn-signup').click(function() {
    var addCoinCreateVerifyClass = addCoinCreateClass + ' .verify-passphrase-form';

    if (!coinsSelectedToAdd || !coinsSelectedToAdd[0]) {
      helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
    } else {
      $(addCoinCreateVerifyClass + ' #passphrase').val('');
      $(addCoinCreateVerifyClass).addClass(hiddenClassName);
      $(addCoinCreateClass + ' .create-account-form').removeClass(hiddenClassName);

      helper.toggleModalWindow(addCoinCreateClass.replace('.', ''), 300);

      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

      if (coinsSelectedToAdd[0]) {
        $(addCoinCreateClass + ' .login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + coinSelectionShowTemplate.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
      }
      initAuthCB();
      $(addCoinCreateClass + ' .login-add-coin-selection-title').click(function() {
        addCoinButtonCB();
      });
      $(addCoinCreateClass + ' .btn-close,' + addCoinCreateClass + ' .modal-overlay').click(function() {
        helper.toggleModalWindow(addCoinCreateClass.replace('.', ''), 300);
      });
      $(addCoinCreateVerifyClass + ' .btn-back').off();
      $(addCoinCreateVerifyClass + ' .btn-back').click(function() {
        $(addCoinCreateVerifyClass).addClass(disabledClassName);
        $(addCoinCreateClass + ' .create-account-form').removeClass(disabledClassName);
      });
      $(addCoinCreateVerifyClass + ' .btn-add-account').off();
      $(addCoinCreateVerifyClass + ' .btn-add-account').click(function() {
        encryptCoindWallet('add-coin-create-wallet-form .verify-passphrase-form');
      });
    }
  });
  $(addCoinLoginClass + ' .login-add-coin-selection-title').click(function() {
    addCoinButtonCB();

    $(addNewCoinFormClass + ' .btn-next').off();
    $(addNewCoinFormClass + ' .btn-next').click(function() {
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

      if (coinsSelectedToAdd[0]) {
        $(addNewCoinFormClass + ' .login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + coinSelectionShowTemplate.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
      }
      // coind
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
      helper.toggleModalWindow(addNewCoinFormClass.replace('.', ''), 300);

      var verifyPassphraseFormClass = '.verify-passphrase-form';

      if (dev.isDev && dev.coinPW.coind[coinsSelectedToAdd[0]]) {
        $(addCoinLoginClass + ' ' + passphraseElName).val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
        $(addCoinLoginClass + ' .btn-signin').removeClass(disabledClassName);
      } else {
        $(addCoinLoginClass + ' ' + passphraseElName).val('');
        $(addCoinLoginClass + ' .btn-signin').addClass(disabledClassName);
      }
      $(verifyPassphraseFormClass + ' ' + passphraseElName).keyup(function() {
        if ($(verifyPassphraseFormClass + ' ' + passphraseElName).val().length > 0) {
          $('.btn-add-account').removeClass(disabledClassName);
        } else {
          $('.btn-btn-add-account').addClass(disabledClassName);
        }
      });
      $(addCoinLoginClass + ' .btn-signin').off();
      $(addCoinLoginClass + ' .btn-signin').click(function() {
        authAllAvailableCoind(addCoinLoginClass.replace('.', ''));
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
  $(addCoinLoginClass + ' .btn-close,' + addCoinLoginClass + ' .modal-overlay').click(function() {
    helper.toggleModalWindow(addCoinLoginClass.replace('.', ''), 300);
    coinsSelectedToAdd = [];
    $('body').removeClass('modal-open');
  });
  // add coin selector modal
  $(addNewCoinFormClass + ' .btn-close,' + addNewCoinFormClass + ' .modal-overlay').click(function() {
    helper.toggleModalWindow(addNewCoinFormClass.replace('.', ''), 300);
    coinsSelectedToAdd = [];
    $('.supported-coins-repeater-inner').html(constructCoinRepeater());
    bindClickInCoinRepeater();
  });
  // add coin passphrase
  $(loginFormClass + ' .btn-close,' + loginFormClass + ' .modal-overlay').click(function() {
    helper.toggleModalWindow(loginFormClass.replace('.', ''), 300);
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
  addedCoinsOutput = helper.trimComma(addedCoinsOutput);
  failedCoinsOutput = helper.trimComma(failedCoinsOutput);

  helper.prepMessageModal(addedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P1') + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P2') : ''), 'green', true);
}