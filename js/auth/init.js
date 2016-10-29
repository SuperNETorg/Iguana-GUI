/*!
 * Iguana auth/init
 *
 */

function loginFormPrepTemplate() {
  var templateToPrep = loginTemplate;

  templateToPrep = templateToPrep.replace(helper.lang('LOGIN.SELECT_A_WALLET'), helper.lang('LOGIN.SELECT_A_COIN'));

  return templateToPrep;
}

function signupFormPrepTemplate() {
  var templateToPrep = signupTemplate,
      coinAlreadyAdded = false;

  templateToPrep = templateToPrep.replace(helper.lang('LOGIN.SELECT_A_WALLET'), helper.lang('LOGIN.SELECT_A_COIN'));

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
  var selectedCoindToEncrypt;

  if (helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
    localstorage.setVal('iguana-active-coin', {});
  }

  // message modal
  helper.initMessageModal();

  var btnSigninElementName = '.btn-signin';
      hiddenClassName = 'hidden',
      disabledClassName = 'disabled',
      addNewCoinFormElementName = '.add-new-coin-form',
      loginFormElementName = '.login-form',
      createAccountFormClassName = '.create-account-form',
      verifyAccountFormClassName = '.verify-passphrase-form',
      loginAddCoinFormSelection = $('.login-add-coin-selection-title'),
      passphraseElementName = '#passphrase',
      iguanaPassphraseWordCount = 24,
      coindPassphraseWordCount = 12;

  // ugly login form check
  if ($(loginFormElementName).hasClass(hiddenClassName)) {
    $('#passphrase').val(dev.isDev && isIguana ? dev.coinPW.iguana : '');

    if (dev.isDev) $(btnSigninElementName).removeClass(disabledClassName);
    if (!isIguana) $(btnSigninElementName).addClass(disabledClassName);

    // load add coin template
    $('body').append(addCoinModalTemplate);
    if (!isIguana) {
      $(addNewCoinFormElementName + ' .form-header .title').html(helper.lang('LOGIN.CREATE_NEW_WALLET'));
      $(addNewCoinFormElementName + ' .form-content .coins-title').html(helper.lang('LOGIN.SELECT_A_WALLET_TO_CREATE'));
    }

    loginAddCoinFormSelection.off();
    loginAddCoinFormSelection.click(function() {
      addCoinButtonCB();
    });

    $(addNewCoinFormElementName + ' .btn-close,.modal-overlay').off();
    $(addNewCoinFormElementName + ' .btn-close,.modal-overlay').click(function() {
      helper.toggleModalWindow(addNewCoinFormElementName.replace('.', ''), 300);
      coinsSelectedByUser = [];
    });

    $(addNewCoinFormElementName + ' .btn-next').off();
    $(addNewCoinFormElementName + ' .btn-next').click(function() {
      addCoinButtonNextAction();
    });
    opacityToggleOnAddCoinRepeaterScroll();
    bindCoinRepeaterSearch();

    if (helper.checkSession(true)) {
      helper.openPage('dashboard');
    } else {
      $('.login-form').removeClass('hidden');
    }
    $(loginFormElementName + ' .btn-signup').off();
    $(loginFormElementName + ' .btn-signup').click(function() {
      helper.openPage('create-account');
    });

    addAuthorizationButtonAction('signin');
    watchPassphraseKeyUpEvent('signin');
  }

  if ($(createAccountFormClassName).width()) {
    if (!isIguana) {
      // 12 word passphrase
      $(createAccountFormClassName + ' .passphrase-word-count').html($(createAccountFormClassName + ' .passphrase-word-count').html().replace(iguanaPassphraseWordCount, coindPassphraseWordCount));
      $(verifyAccountFormClassName + ' .passphrase-word-count').html($(verifyAccountFormClassName + ' .passphrase-word-count').html().replace(iguanaPassphraseWordCount, coindPassphraseWordCount));
    }

    // load add coin template
    if (helper.getCurrentPage() === 'create-account') {
      $('body').append(addCoinModalTemplate);
      $(addNewCoinFormElementName + ' .form-header .title').html(helper.lang('LOGIN.CREATE_NEW_WALLET'));
      $(addNewCoinFormElementName + ' .form-content .coins-title').html(helper.lang('LOGIN.SELECT_A_WALLET_TO_CREATE'));
    }

    loginAddCoinFormSelection.off();
    loginAddCoinFormSelection.click(function() {
      addCoinButtonCB();
    });

    if (helper.getCurrentPage() === 'create-account') {
      $(addNewCoinFormElementName + ' .btn-close,.modal-overlay').off();
      $(addNewCoinFormElementName + ' .btn-close,.modal-overlay').click(function() {
        helper.toggleModalWindow(addNewCoinFormElementName.replace('.', ''), 300);
        coinsSelectedByUser = [];
      });
    }

    $(addNewCoinFormElementName + ' .btn-next').off();
    $(addNewCoinFormElementName + ' .btn-next').click(function() {
      addCoinButtonNextAction();
    });
    opacityToggleOnAddCoinRepeaterScroll();
    bindCoinRepeaterSearch();

    addAuthorizationButtonAction('add-account');
    watchPassphraseKeyUpEvent('add-account');
    initCreateAccountForm();
    helper.addCopyToClipboardFromElement('.generated-passhprase', helper.lang('LOGIN.PASSPHRASE'));

    $(createAccountFormClassName + ' .btn-back').off();
    $(createAccountFormClassName + ' .btn-back').click(function() {
      helper.openPage('login');
    });

    $(verifyAccountFormClassName + ' .btn-back').off();
    $(verifyAccountFormClassName + ' .btn-back').click(function() {
      helper.openPage('create-account');
    });

    $(verifyAccountFormClassName + ' .paste-from-clipboard-link').off();
    $(verifyAccountFormClassName + ' .paste-from-clipboard-link').click(function() {
      try {
        if (pasteTextFromClipboard)
          $(verifyAccountFormClassName + ' ' + passphraseElementName).val(pasteTextFromClipboard); // not quite appropriate pasting
          if ($(verifyAccountFormClassName + ' ' + passphraseElementName).val().length > 0) $(verifyAccountFormClassName + ' .btn-add-account').removeClass('disabled');
      } catch(e) {
        // do nothing
      }
    });
  }
}

$(window).resize(function() {
  opacityToggleOnAddCoinRepeaterScroll();
});

var coinSelectionShowTemplate = '<br/><span class=\"small\">{{ item }}</span>';

function addCoinButtonNextAction() {
  var loginFormPassphrase = $('.login-form #passphrase'),
      loginAddCoinFormSelection = $('.login-add-coin-selection-title')
  coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

  if (coinsSelectedToAdd[0]) {
    if (!isIguana) {
      loginAddCoinFormSelection.html(supportedCoinsList[coinsSelectedToAdd[0]].name + coinSelectionShowTemplate.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
      $('.btn-signin').removeClass('disabled');
    } else {
      loginAddCoinFormSelection.html('');
      if (coinsSelectedToAdd.length === 1) {
        loginAddCoinFormSelection.html(supportedCoinsList[coinsSelectedToAdd[0]].name + coinSelectionShowTemplate.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
      } else {
        for (var i=0; i < coinsSelectedToAdd.length; i++) {
          loginAddCoinFormSelection.html(loginAddCoinFormSelection.html() + supportedCoinsList[coinsSelectedToAdd[i]].name + '<br/>');
        }
      }
    }
    loginFormPassphrase.val('');
    // dev only
    if (dev.isDev && !isIguana && dev.coinPW.coind[coinsSelectedToAdd[0]] && helper.getCurrentPage() === 'login') loginFormPassphrase.val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
    if (dev.isDev && isIguana && dev.coinPW.iguana && helper.getCurrentPage() === 'login') loginFormPassphrase.val(dev.coinPW.iguana);
    helper.toggleModalWindow('add-new-coin-form', 300);
  }
}