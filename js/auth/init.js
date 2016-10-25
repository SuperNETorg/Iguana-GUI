/*!
 * Iguana auth/init
 *
 */

function loginFormPrepTemplate() {
  var templateToPrep = loginTemplate;

  templateToPrep = templateToPrep.replace('Select a wallet', 'Select a coin');

  return templateToPrep;
}

function signupFormPrepTemplate() {
  var templateToPrep = signupTemplate,
      coinAlreadyAdded = false;

  templateToPrep = templateToPrep.replace('Select a wallet', 'Select a coin');

  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true) {
      templateToPrep = templateToPrep.replace('login-add-coin-selection-title', 'login-add-coin-selection-title hidden');
      coinsSelectedToAdd = [];
      coinsSelectedToAdd[0] = key;
      coinAlreadyAdded = true;
    }
  }

  if (!coinAlreadyAdded && coinsSelectedToAdd) {
    coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
    coinsSelectedToAdd = coinsSelectedToAdd[0];
    templateToPrep = templateToPrep.replace('login-add-coin-selection-title', 'login-add-coin-selection-title hidden');
  }

  return templateToPrep;
}

function initAuthCB() {
  var api = new apiProto(),
      selectedCoindToEncrypt;

  if (helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
    localstorage.setVal('iguana-active-coin', {});
  }

  // message modal
  helper.initMessageModal();

  // ugly login form check
  if ($('.login-form').hasClass('hidden')) {
    $('#passphrase').val(dev.isDev && isIguana ? dev.coinPW.iguana : '');

    if (dev.isDev) $('.btn-signin').removeClass('disabled');
    if (!isIguana) $('.btn-signin').addClass('disabled');

    // load add coin template
    $('body').append(addCoinModalTemplate);
    if (!isIguana) {
      $('.add-new-coin-form .form-header .title').html('Create new wallet');
      $('.add-new-coin-form .form-content .coins-title').html('Select a wallet to create');
    }

    $('.login-add-coin-selection-title').off();
    $('.login-add-coin-selection-title').click(function() {
      addCoinButtonCB();
    });

    $('.add-new-coin-form .btn-close,.modal-overlay').off();
    $('.add-new-coin-form .btn-close,.modal-overlay').click(function() {
      helper.toggleModalWindow('add-new-coin-form', 300);
      coinsSelectedByUser = [];
    });

    $('.add-new-coin-form .btn-next').off();
    $('.add-new-coin-form .btn-next').click(function() {
      addCoinButtonNextAction();
    });
    opacityToggleOnAddCoinRepeaterScroll();
    bindCoinRepeaterSearch();

    if (helper.checkSession(true)) {
      helper.openPage('dashboard');
    } else {
      $('.login-form').removeClass('hidden');
    }
    $('.login-form .btn-signup').off();
    $('.login-form .btn-signup').click(function() {
      helper.openPage('create-account');
    });

    addAuthorizationButtonAction('signin');
    watchPassphraseKeyUpEvent('signin');
  }

  if ($('.create-account-form').width()) {
    if (!isIguana) {
      // 12 word passphrase
      $('.create-account-form .passphrase-word-count').html($('.create-account-form .passphrase-word-count').html().replace('24', '12'));
      $('.verify-passphrase-form .passphrase-word-count').html($('.verify-passphrase-form .passphrase-word-count').html().replace('24', '12'));
    }

    // load add coin template
    if (helper.getCurrentPage() === 'create-account') {
      $('body').append(addCoinModalTemplate);
      $('.add-new-coin-form .form-header .title').html('Create new wallet');
      $('.add-new-coin-form .form-content .coins-title').html('Select a wallet to create');
    }

    $('.login-add-coin-selection-title').off();
    $('.login-add-coin-selection-title').click(function() {
      addCoinButtonCB();
    });

    if (helper.getCurrentPage() === 'create-account') {
      $('.add-new-coin-form .btn-close,.modal-overlay').off();
      $('.add-new-coin-form .btn-close,.modal-overlay').click(function() {
        helper.toggleModalWindow('add-new-coin-form', 300);
        coinsSelectedByUser = [];
      });
    }

    $('.add-new-coin-form .btn-next').off();
    $('.add-new-coin-form .btn-next').click(function() {
      addCoinButtonNextAction();
    });
    opacityToggleOnAddCoinRepeaterScroll();
    bindCoinRepeaterSearch();

    addAuthorizationButtonAction('add-account');
    watchPassphraseKeyUpEvent('add-account');
    initCreateAccountForm();
    constructCoinsRepeaterEncrypt();
    helper.addCopyToClipboardFromElement('.generated-passhprase', 'Passphrase');

    $('.create-account-form .btn-back').off();
    $('.create-account-form .btn-back').click(function() {
      helper.openPage('login');
    });

    $('.verify-passphrase-form .btn-back').off();
    $('.verify-passphrase-form .btn-back').click(function() {
      helper.openPage('create-account');
    });

    $('.verify-passphrase-form .paste-from-clipboard-link').off();
    $('.verify-passphrase-form .paste-from-clipboard-link').click(function() {
      try {
        if (pasteTextFromClipboard)
          $('.verify-passphrase-form #passphrase').val(pasteTextFromClipboard); // not quite appropriate pasting
          if ($('.verify-passphrase-form #passphrase').val().length > 0) $('.verify-passphrase-form .btn-add-account').removeClass('disabled');
      } catch(e) {
        // do nothing
      }
    });
  }
}

$(window).resize(function() {
  opacityToggleOnAddCoinRepeaterScroll();
});

function addCoinButtonNextAction() {
  coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

  if (coinsSelectedToAdd[0]) {
    if (!isIguana) {
      $('.login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + '<br/><span class=\"small\">' + coinsSelectedToAdd[0].toUpperCase() + '</span>');
      $('.btn-signin').removeClass('disabled');
    } else {
      $('.login-add-coin-selection-title').html('');
      if (coinsSelectedToAdd.length === 1) {
        $('.login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + '<br/><span class=\"small\">' + coinsSelectedToAdd[0].toUpperCase() + '</span>');
      } else {
        for (var i=0; i < coinsSelectedToAdd.length; i++) {
          $('.login-add-coin-selection-title').html($('.login-add-coin-selection-title').html() + supportedCoinsList[coinsSelectedToAdd[i]].name + '<br/>');
        }
      }
    }
    $('.login-form #passphrase').val('');
    // dev only
    if (dev.isDev && !isIguana && dev.coinPW.coind[coinsSelectedToAdd[0]] && helper.getCurrentPage() === 'login') $('.login-form #passphrase').val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
    if (dev.isDev && isIguana && dev.coinPW.iguana && helper.getCurrentPage() === 'login') $('.login-form #passphrase').val(dev.coinPW.iguana);
    helper.toggleModalWindow('add-new-coin-form', 300);
  }
}