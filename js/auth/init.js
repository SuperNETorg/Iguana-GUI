/*!
 * Iguana auth/init
 *
 */

 // !! TODO: remove or keep multi-wallet login !!

function initAuthCB() {
  var localStorage = new localStorageProto(),
      helper = new helperProto(),
      selectedCoindToEncrypt;

  localStorage.setVal('iguana-active-coin', {});

  // ugly login form check
  if ($('.login-form').hasClass('hidden')) {
    $('#passphrase').val(dev.isDev && isIguana ? dev.coinPW.iguana : '');

    if (dev.isDev) $('.btn-signin').removeClass('disabled');

    if (!isIguana) $('.btn-signin').addClass('disabled');
    // load add coin template
    $('body').append(addCoinModalTemplate);
    $('.add-new-coin-form .form-header .title').html('Create new wallet');
    $('.add-new-coin-form .form-content .coins-title').html('Select a wallet to create');

    $('.login-add-coin-selection-title').click(function() {
      addCoinButtonCB();
    });

    $('.btn-close,.modal-overlay').click(function() {
      helper.toggleModalWindow('add-new-coin-form', 300);
      coinsSelectedByUser = [];
    });
    $('.btn-next').click(function() {
      addCoinButtonNextAction();
    });
    opacityToggleOnAddCoinRepeaterScroll();
    bindCoinRepeaterSearch();

    if (helper.checkSession(true)) {
      helper.openPage('dashboard');
    } else {
      $('.login-form').removeClass('hidden');
    }
    $('.login-form .btn-signup').click(function() {
      helper.openPage('create-account');
    });

    constructAuthCoinsRepeater();
    addAuthorizationButtonAction('signin');
    watchPassphraseKeyUpEvent('signin');
  }

  if ($('.create-account-form').width()) {
    // load add coin template
    $('body').append(addCoinModalTemplate);
    $('.add-new-coin-form .form-header .title').html('Create new wallet');
    $('.add-new-coin-form .form-content .coins-title').html('Select a wallet to create');

    $('.login-add-coin-selection-title').click(function() {
      addCoinButtonCB();
    });

    $('.btn-close,.modal-overlay').click(function() {
      helper.toggleModalWindow('add-new-coin-form', 300);
      coinsSelectedByUser = [];
    });
    $('.btn-next').click(function() {
      addCoinButtonNextAction();
    });
    opacityToggleOnAddCoinRepeaterScroll();
    bindCoinRepeaterSearch();

    addAuthorizationButtonAction('add-account');
    watchPassphraseKeyUpEvent('add-account');
    initCreateAccountForm();
    constructCoinsRepeaterEncrypt();
    helper.addCopyToClipboardFromElement('.generated-passhprase', 'Passphrase');

    $('.create-account-form .login-input-directions').html($('.create-account-form .login-input-directions').html().replace('24', '12'));

    $('.create-account-form .btn-back').click(function() {
      helper.openPage('login');
    });

    $('.verify-passphrase-form .btn-back').click(function() {
      helper.openPage('create-account');
    });

    $('.paste-from-clipboard-link').click(function() {
      try {
        if (pasteTextFromClipboard)
          $('#passphrase').val(pasteTextFromClipboard); // not quite appropriate pasting
          if ($('#passphrase').val().length > 0) $('.btn-add-account').removeClass('disabled');
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
  var helper = new helperProto();
  coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

  if (coinsSelectedToAdd[0]) {
    $('.login-add-coin-selection-title').html(supportedCoinsList[coinsSelectedToAdd[0]].name + '<br/><span class=\"small\">' + coinsSelectedToAdd[0].toUpperCase() + '</span>');
    if (!isIguana) $('.btn-signin').removeClass('disabled');
    if (dev.isDev && dev.coinPW.coind[coinsSelectedToAdd[0]] && helper.getCurrentPage() === 'index') $('#passphrase').val(dev.coinPW.coind[coinsSelectedToAdd[0]]);
    else $('#passphrase').val('');
    helper.toggleModalWindow('add-new-coin-form', 300);
  }
}