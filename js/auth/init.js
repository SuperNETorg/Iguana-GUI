/*!
 * Iguana auth/init
 *
 */

function loginFormPrepTemplate() {
  var templateToPrep = templates.all.login;

  templateToPrep = isIguana ? templateToPrep.replace('{{ selectItemAction }}', helper.lang('LOGIN.SELECT_A_COIN')) : templateToPrep.replace('{{ selectItemAction }}', helper.lang('LOGIN.SELECT_A_WALLET'));

  return templateToPrep;
}

function signupFormPrepTemplate() {
  var templateToPrep = templates.all.signup,
      coinAlreadyAdded = false;

  for (var key in coinsInfo) {
    if (coinsInfo[key].connection === true && isIguana || !isIguana && coinsSelectedToAdd && coinsSelectedToAdd[0]) {
      templateToPrep = templateToPrep.replace('login-add-coin-selection', 'login-add-coin-selection hidden');
      coinsSelectedToAdd = [];
      coinsSelectedToAdd[0] = key;
      coinAlreadyAdded = true;
    }
  }

  if (!coinAlreadyAdded && coinsSelectedToAdd && coinsSelectedToAdd[0]) {
    coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
    coinsSelectedToAdd = coinsSelectedToAdd[0];
    templateToPrep = templateToPrep.replace('login-add-coin-selection', 'login-add-coin-selection hidden');
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

  var btnSigninElementName = '.btn-signin',
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
  if (helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
    $('.create-account-form .login-add-coin-selection-title,.login-form .login-add-coin-selection-title').off();
    $('.create-account-form .login-add-coin-selection-title,.login-form .login-add-coin-selection-title').click(function() {
      addCoinButtonCB();
      $('.btn-next').addClass('disabled');
    });
  }

  if ($(loginFormElementName).hasClass(hiddenClassName)) {
    $('#passphrase').val(dev.isDev && isIguana ? dev.coinPW.iguana : '');

    if (dev.isDev) $(btnSigninElementName).removeClass(disabledClassName);
    if (!isIguana) $(btnSigninElementName).addClass(disabledClassName);

    // load add coin template
    $('body').append(templates.all.addCoin);
    if (!isIguana) {
      $(addNewCoinFormElementName + ' .form-header .title').html(helper.lang('LOGIN.CREATE_NEW_WALLET'));
      $(addNewCoinFormElementName + ' .form-content .coins-title').html(helper.lang('LOGIN.SELECT_A_WALLET_TO_CREATE'));
    }

    $(addNewCoinFormElementName + ' .btn-close,.modal-overlay').off();
    $(addNewCoinFormElementName + ' .btn-close,.modal-overlay').click(function() {
      helper.toggleModalWindow(addNewCoinFormElementName.replace('.', ''), 300);
      coinsSelectedByUser = [];
    });

    $(addNewCoinFormElementName + ' .btn-next').off();
    $(addNewCoinFormElementName + ' .btn-next').click(function() {
      addCoinButtonNextAction();
    });
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
      $('body').append(templates.all.addCoin);
      $(addNewCoinFormElementName + ' .form-header .title').html(helper.lang('LOGIN.CREATE_NEW_WALLET'));
      $(addNewCoinFormElementName + ' .form-content .coins-title').html(helper.lang('LOGIN.SELECT_A_WALLET_TO_CREATE'));
    }

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

function addCoinButtonNextAction() {
  var loginFormPassphrase = $('.login-form #passphrase'),
      loginAddCoinFormSelection = $('.login-add-coin-selection-title')
  coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

  if (coinsSelectedToAdd[0]) {
    if (!isIguana) {
      loginAddCoinFormSelection.html(supportedCoinsList[coinsSelectedToAdd[0]].name + templates.all.repeaters.coinSelectionShowItem.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
      if ($('.login-form #passphrase').val() !== '') $('.btn-signin').removeClass('disabled');
    } else {
      loginAddCoinFormSelection.html('');
      if (coinsSelectedToAdd.length === 1) {
        loginAddCoinFormSelection.html(supportedCoinsList[coinsSelectedToAdd[0]].name + templates.all.repeaters.coinSelectionShowItem.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
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