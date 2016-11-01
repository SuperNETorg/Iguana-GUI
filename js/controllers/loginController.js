'use strict';

angular.module('IguanaGUIApp.controllers')
.controller('loginController', ['$scope', '$http', '$state', 'helper', function($scope, $http, $state, helper) {
    $scope.helper = helper;
    $scope.$state = $state;
    $scope.passphrase = '';
    $scope.coinsSelectedToAdd = {};

    /* legacy code */
    $(document).ready(function() {
      api.testConnection(initPage);
    });

    function initPage() {
      if (helper.checkSession(true)) {
        $state.go('dashboard');
      } else {
        initAuthCB();
      }
    }

    $scope.toggleAddCoinModal = function() {
      var availableCoins = helper.addCoinButtonCB();
      $scope.availableCoins = availableCoins;

      /* legacy, seems to work fine */
      helper.opacityToggleOnAddCoinRepeaterScroll();
      $('.supported-coins-repeater').scroll(function(e) {
        helper.opacityToggleOnAddCoinRepeaterScroll();
      });
      helper.bindCoinRepeaterSearch();
    }

    $scope.objLen = function(obj) {
      return Object.keys(obj).length;
    }

    $scope.toggleCoinTile = function(item) {

      if (!isIguana) {
        $scope.coinsSelectedToAdd = {};
      }

      if ($scope.coinsSelectedToAdd[item.coinId]) {
        delete $scope.coinsSelectedToAdd[item.coinId];
      } else {
        $scope.coinsSelectedToAdd[item.coinId] = true;
      }
    }

    $scope.addCoinNext = function() {
      helper.toggleModalWindow('add-new-coin-form', 300);
      var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);

      // dev only
      if (dev.isDev && !isIguana && dev.coinPW.coind[coinsSelectedToAdd[0]]) $scope.passphrase = dev.coinPW.coind[coinsSelectedToAdd[0]];
      if (dev.isDev && isIguana && dev.coinPW.iguana) $scope.passphrase = dev.coinPW.iguana;
    }

    $scope.login = function() {
      var coinsSelectedToAdd = helper.reindexAssocArray($scope.coinsSelectedToAdd);
      api.walletLock(coinsSelectedToAdd[0]);
      var walletLogin = api.walletLogin($scope.passphrase, settings.defaultSessionLifetime, coinsSelectedToAdd[0]);

      if (walletLogin !== -14 && walletLogin !== -15) {
        localstorage.setVal('iguana-' + coinsSelectedToAdd[0] + '-passphrase', { 'logged': 'yes' });
        localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
        $state.go('dashboard');
      }
      if (walletLogin === -14) {
        helper.prepMessageModal(helper.lang('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
      }
      if (walletLogin === -15) {
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'), 'red', true);
      }
    }

    $scope.watchPassphraseKeyUpEvent = function(buttonClassName) {
      if ($scope.passphrase.length > 0) {
        button.removeClass(disabledClassName);
      } else {
        button.addClass(disabledClassName);
      }
    }

    var passphraseToVerify,
        coindAuthResults = [];

    function toggleLoginErrorStyling(isError) {
      var passphrase = $('#passphrase'),
          loginInputDirectionsError = $('.login-input-directions-error.col-red'),
          loginInputDirections = $('.login-input-directions'),
          errorClassName = 'error',
          hiddenClassName = 'hidden';

      if (isError) {
        if (isIguana && helper.getCurrentPage() === 'login') loginInputDirectionsError.removeClass(hiddenClassName);
        passphrase.addClass(errorClassName);
        loginInputDirections.addClass(hiddenClassName);
      } else {
        passphrase.removeClass(errorClassName);
        loginInputDirectionsError.addClass(hiddenClassName);
      }
      passphrase.val('');
    }

    function addAuthorizationButtonAction(buttonClassName) {
      var hiddenClassName = 'hidden',
          button = $('.btn-' + buttonClassName),
          loginForm = $('.login-form'),
          verifyPassphraseForm = $('.verify-passphrase-form'),
          loginInputDirectionsError = $('.login-input-directions-error');

      button.off();
      button.click(function() {
        if (isIguana) {
          if (!checkIguanaCoinsSelection(buttonClassName === 'add-account' ? true : false)) {
            helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_COIN'), 'blue', true);
          } else {
            if (helper.getCurrentPage() === 'create-account') addAccountIguanaCoind('add-account');
          }
        } else {
          if (!verifyPassphraseForm.hasClass(hiddenClassName)) {
            authAllAvailableCoind();
          }
          if (loginForm.width()) {
            loginInputDirectionsError.removeClass(hiddenClassName);
            addAccountIguanaCoind(buttonClassName, true);
          }
        }
      });
    }

    function addAccountIguanaCoind(buttonClassName, isCoind) {
      // validate passphrase
      // iguana env condition: 24 words in lower case followed by a single space character
      var passphraseInput = $('#passphrase').val(),
          totalSubstr = passphraseInput.match(/\b\w+\b/g),
          totalSubstrAlpha = passphraseInput.match(/\b[a-z]+\b/g), // count only words consist of characters
          totalSpaces = passphraseInput.match(/\s/g),
          passphraseLength = 24, // words
          hiddenClassName = 'hidden',
          loginInputDirectionsError = $('.login-input-directions-error');

      if (totalSubstr && totalSubstrAlpha && totalSpaces) {
        if ((buttonClassName === 'signin') ? true : totalSubstr.length === passphraseLength && totalSubstrAlpha.length === passphraseLength && totalSpaces.length === passphraseLength - 1) {
          if (!isCoind ? (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : verifyNewPassphrase() && api.walletEncrypt(passphraseInput)) :
                         (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : encryptCoindWallet())) {
            toggleLoginErrorStyling(false);

            if (buttonClassName === 'add-account') {
              helper.openPage('login');
              setTimeout(function() {
                helper.prepMessageModal(helper.lang('MESSAGE.WALLET_IS_CREATED'), 'green', true);
              }, 300);
            } else {
              localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
              helper.openPage('dashboard');
            }
          } else {
            toggleLoginErrorStyling(true);
          }
        } else {
          toggleLoginErrorStyling(true);
        }
      } else {
        toggleLoginErrorStyling(true);

        if (isCoind)
          helper.prepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH'), 'red', true);
          loginInputDirectionsError.removeClass(hiddenClassName);
      }
    }

    function addAuthorizationButtonAction(buttonClassName) {
      var hiddenClassName = 'hidden',
          button = $('.btn-' + buttonClassName),
          loginForm = $('.login-form'),
          verifyPassphraseForm = $('.verify-passphrase-form'),
          loginInputDirectionsError = $('.login-input-directions-error');

      button.off();
      button.click(function() {
        if (isIguana) {
          if (!checkIguanaCoinsSelection(buttonClassName === 'add-account' ? true : false)) {
            helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_COIN'), 'blue', true);
          } else {
            if (helper.getCurrentPage() === 'create-account') addAccountIguanaCoind('add-account');
          }
        } else {
          if (!verifyPassphraseForm.hasClass(hiddenClassName)) {
            authAllAvailableCoind();
          }
          if (loginForm.width()) {
            loginInputDirectionsError.removeClass(hiddenClassName);
            addAccountIguanaCoind(buttonClassName, true);
          }
        }
      });
    }

    function addAccountIguanaCoind(buttonClassName, isCoind) {
      // validate passphrase
      // iguana env condition: 24 words in lower case followed by a single space character
      var passphraseInput = $('#passphrase').val(),
          totalSubstr = passphraseInput.match(/\b\w+\b/g),
          totalSubstrAlpha = passphraseInput.match(/\b[a-z]+\b/g), // count only words consist of characters
          totalSpaces = passphraseInput.match(/\s/g),
          passphraseLength = 24, // words
          hiddenClassName = 'hidden',
          loginInputDirectionsError = $('.login-input-directions-error');

      if (totalSubstr && totalSubstrAlpha && totalSpaces) {
        if ((buttonClassName === 'signin') ? true : totalSubstr.length === passphraseLength && totalSubstrAlpha.length === passphraseLength && totalSpaces.length === passphraseLength - 1) {
          if (!isCoind ? (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : verifyNewPassphrase() && api.walletEncrypt(passphraseInput)) :
                         (buttonClassName === 'signin' ? api.walletLogin(passphraseInput, defaultSessionLifetime) : encryptCoindWallet())) {
            toggleLoginErrorStyling(false);

            if (buttonClassName === 'add-account') {
              helper.openPage('login');
              setTimeout(function() {
                helper.prepMessageModal(helper.lang('MESSAGE.WALLET_IS_CREATED'), 'green', true);
              }, 300);
            } else {
              localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
              helper.openPage('dashboard');
            }
          } else {
            toggleLoginErrorStyling(true);
          }
        } else {
          toggleLoginErrorStyling(true);
        }
      } else {
        toggleLoginErrorStyling(true);

        if (isCoind)
          helper.prepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH'), 'red', true);
          loginInputDirectionsError.removeClass(hiddenClassName);
      }
    }

    function watchPassphraseKeyUpEvent(buttonClassName) {
      var passphrase = $('#passphrase'),
          disabledClassName = 'disabled',
          button = $('.btn-' + buttonClassName);

      passphrase.keyup(function() {
        if (passphrase.val().length > 0) {
          button.removeClass(disabledClassName);
        } else {
          button.addClass(disabledClassName);
        }
      });
    }

    var addCoinResponses = [],
        selectedCoins = 0,
        coinsSelectedToAdd,
        buttonClassNameCB = '';

    function authAllAvailableCoind(modalClassName) {
      var result = false,
          passphrase = $((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase');

      coindAuthResults = [];

      if (!coinsSelectedToAdd)
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
      else
        api.walletLock(coinsSelectedToAdd[0], api.walletLogin(passphrase.val(), defaultSessionLifetime, coinsSelectedToAdd[0], authAllAvailableCoindCB));

      return result;
    }

    function authAllAvailableCoindCB(result, key) {
      coindAuthResults[key] = result;

      if (coindAuthResults[key] !== -14 && coindAuthResults[key] !== -15) localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'yes' });
      if (coindAuthResults[key] === -14) {
        if (coinsSelectedToAdd.length === 1 && helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'dashboard') helper.prepMessageModal(helper.lang('MESSAGE.WRONG_PASSPHRASE'), 'red', true);
        result = false;
      }
      if (coindAuthResults[key] === -15 && helper.getCurrentPage() !== 'create-account') {
        if (coinsSelectedToAdd.length === 1) helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_ENCRYPT_YOUR_WALLET'), 'red', true);
        result = false;
      }

      // check coind login results
      var seletedLoginCoind = $('.non-iguana-coins-repeater').find('input:checked'); // remove(?)
      // all coind walletpassphrase responses are arrived by now
      if (coinsSelectedToAdd.length === 1 || Object.keys(coindAuthResults).length === seletedLoginCoind.length) {
        var isAnyCoindLoginError = false;

        for (var key in coindAuthResults) {
          if (coindAuthResults[key] === -14 || coindAuthResults[key] === -15) isAnyCoindLoginError = true;
        }

        if (!isAnyCoindLoginError && helper.getCurrentPage() !== 'dashboard') {
          localstorage.setVal('iguana-auth', { 'timestamp': Date.now() });
          helper.openPage('dashboard');
        } else {
          if (!isAnyCoindLoginError) {
            helper.toggleModalWindow('add-coin-login-form', 300);
            $('body').removeClass('modal-open');
            if (helper.getCurrentPage() === 'dashboard') constructAccountCoinRepeater();
          }
        }
      }
    }

    function encryptCoindWallet(modalClassName) {
      var passphraseInput = $((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val(),
          result = false,
          addCoinCreateWalletModalClassName = 'add-coin-create-wallet-form';

      if (coinsSelectedToAdd[0]) selectedCoindToEncrypt = coinsSelectedToAdd[0];

      if (verifyNewPassphrase(modalClassName)) {
        var walletEncryptResponse = api.walletEncrypt(passphraseInput, selectedCoindToEncrypt);

        if (walletEncryptResponse !== -15) {
          result = true;
          $('.non-iguana-walletpassphrase-errors').html(''); // remove(?)
          helper.prepMessageModal(selectedCoindToEncrypt + helper.lang('MESSAGE.X_WALLET_IS_CREATED'), 'green', true);
          if (helper.getCurrentPage() === 'dashboard') {
            helper.toggleModalWindow(addCoinCreateWalletModalClassName, 300);
          } else {
            helper.openPage('login');
          }
        } else {
          helper.prepMessageModal(helper.lang('MESSAGE.WALLET_IS_ALREADY_ENCRYPTED'), 'red', true);
          if (helper.getCurrentPage() === 'dashboard') {
            helper.toggleModalWindow(addCoinCreateWalletModalClassName, 300);
          }
          result = false;
        }
      } else {
        helper.prepMessageModal(helper.lang('MESSAGE.PASSPHRASES_DONT_MATCH_ALT'), 'red', true);
        result = false;
      }

      return result;
    }

    function checkSelectedWallet(key) {
      var isCoindChecked = false;

      if (coinsSelectedToAdd && coinsSelectedToAdd[0]) {
        selectedCoindToEncrypt = key = coinsSelectedToAdd[0];
        return true;
      } else {
        helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_WALLET'), 'blue', true);
      }

      if (key) {
        selectedCoindToEncrypt = key;
      } else {
        return isCoindChecked;
      }
    }

    function checkIguanaCoinsSelection(suppressAddCoin) {
      var result = false;

      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

      selectedCoins = 0;

      if (!suppressAddCoin) {
        buttonClassNameCB = 'signin';
        addCoinResponses = [];

        for (var key in coinsInfo) {
          localstorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });
        }

        for (var i=0; i < coinsSelectedToAdd.length; i++) {
          if (coinsSelectedToAdd[i]) {
            selectedCoins++;

            (function(x) {
              setTimeout(function() {
                api.addCoin(coinsSelectedToAdd[x], addCoinCB);
              }, x === 0 ? 0 : settings.addCoinTimeout * 1000);
            })(i);
          }

          if (selectedCoins > 0) result = true;
        }
      } else {
        buttonClassNameCB = 'add-account';
        result = true;
      }

      return result;
    }

    function addCoinCB(response, coin) {
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

      helper.prepMessageModal(addedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P1') + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P2') : '') + (Object.keys(addCoinResponses).length === selectedCoins ? '<br/>' + helper.lang('MESSAGE.REDIRECTING_TO_DASHBOARD') + '...' : ''), 'green', true);

      if (Object.keys(addCoinResponses).length === selectedCoins) {
        // since there's no error on nonexistent wallet passphrase in Iguana
        // redirect to dashboard with 5s timeout
        // TODO(?): point out if a coin is already running
        setTimeout(function() {
          addAccountIguanaCoind(buttonClassNameCB);
        }, settings.addCoinInfoModalTimeout * 1000);
      }
    }

    var passphraseToVerify;

    function verifyNewPassphrase(modalClassName) {
      if (passphraseToVerify === $((modalClassName ? '.' + modalClassName + ' ' : '') + '#passphrase').val()) return true;
      else return false;
    }

    function initCreateAccountForm() {
      var newPassphrase = PassPhraseGenerator.generatePassPhrase(isIguana ? 8 : 4), // TODO: make configurable
          hiddenClassName = 'hidden',
          disabledClassName = 'disabled',
          verifyAccounFormClassName = '.verify-passphrase-form',
          createAccountFormClassName = '.create-account-form',
          buttonVerifyPassphrase = $('.btn-verify-passphrase'),
          loginAddCoinSelection = $('.login-add-coin-selection-title'),
          passphrase = $('#passphrase'),
          generatedPassphrase = $('.generated-passhprase'),
          passphraseSavedCheckbox = $('#passphrase-saved-checkbox');

      selectedCoindToEncrypt = null;
      //if (!isIguana) $('.btn-add-account').html('Encrypt wallet');

      passphrase.show();
      $('.non-iguana-walletpassphrase-errors').html(''); // remove(?)
      $(verifyAccounFormClassName + ' .login-input-directions-error').addClass(hiddenClassName);
      $(verifyAccounFormClassName + ' #passphrase').removeClass('error');
      $(createAccountFormClassName).removeClass(hiddenClassName);
      $(verifyAccounFormClassName).addClass(hiddenClassName);
      passphrase.val('');
      passphraseSavedCheckbox.prop('checked', false);
      generatedPassphrase.html(newPassphrase);
      $('.generated-passhprase-hidden').val(newPassphrase);
      buttonVerifyPassphrase.addClass(disabledClassName);

      passphraseSavedCheckbox.off();
      passphraseSavedCheckbox.click(function() {
        if (passphraseSavedCheckbox.prop('checked'))
          buttonVerifyPassphrase.removeClass(disabledClassName);
        else
          buttonVerifyPassphrase.addClass(disabledClassName);
      });

      $(verifyAccounFormClassName + ' .btn-back').off();
      $(verifyAccounFormClassName + ' .btn-back').click(function() {
        helper.openPage('create-account');
      });

      $(createAccountFormClassName + ' .btn-back').off();
      $(createAccountFormClassName + ' .btn-back').click(function() {
        helper.openPage('login');
      });

      buttonVerifyPassphrase.off();
      buttonVerifyPassphrase.click(function() {
        if (isIguana) {
          coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);
          if (coinsSelectedToAdd[0]) {
            var addCoinResult,
                coinIsRunning = false;

            for (var key in coinsInfo) {
              if (coinsInfo[key].connection === true) {
                coinIsRunning = true;
                addCoinResult = true;
              }
            }

            if (!coinIsRunning) addCoinResult = api.addCoin(coinsSelectedToAdd[0]);

            if (addCoinResult) {
              coinsInfo[coinsSelectedToAdd[0]].connection = true;
              loginAddCoinSelection.addClass(hiddenClassName);
              passphraseToVerify = generatedPassphrase.text();
              $(createAccountFormClassName).addClass('hidden');
              $(verifyAccounFormClassName).removeClass('hidden');
              $('.non-iguana-coins-repeater-errors').html(''); // remove(?)
            } else {
              helper.prepMessageModal(helper.lang('MESSAGE.COIN_ADD_ERROR_P1') + ' ' + coinsSelectedToAdd[0] + ' ' + helper.lang('MESSAGE.COIN_ADD_ERROR_P2'), 'red', true);
            }
          } else {
            loginAddCoinSelection.removeClass(hiddenClassName);
            helper.prepMessageModal(helper.lang('MESSAGE.PLEASE_SELECT_A_COIN'), 'blue', true);
          }
        } else {
          if (checkSelectedWallet()) {
            passphraseToVerify = generatedPassphrase.text();
            $(createAccountFormClassName).addClass(hiddenClassName);
            $(verifyAccounFormClassName).removeClass(hiddenClassName);
            $('.non-iguana-coins-repeater-errors').html(''); // remove(?)
          } else {
            //$('.non-iguana-coins-repeater-errors').html('<div class=\"center\">Please select at least one coin</div>');
          }
        }
      });
    }

    /* login/signup init */
    function loginFormPrepTemplate() {
      var templateToPrep = templates.all.login;

      templateToPrep = templateToPrep.replace(helper.lang('LOGIN.SELECT_A_WALLET'), helper.lang('LOGIN.SELECT_A_COIN'));

      return templateToPrep;
    }

    function signupFormPrepTemplate() {
      var templateToPrep = templates.all.signup,
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

        loginAddCoinFormSelection.off();
        loginAddCoinFormSelection.click(function() {
          addCoinButtonCB();
          $('.btn-next').addClass('disabled');
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
          $('body').append(templates.all.addCoin);
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

    function addCoinButtonNextAction() {
      var loginFormPassphrase = $('.login-form #passphrase'),
          loginAddCoinFormSelection = $('.login-add-coin-selection-title')
      coinsSelectedToAdd = helper.reindexAssocArray(coinsSelectedToAdd);

      if (coinsSelectedToAdd[0]) {
        if (!isIguana) {
          loginAddCoinFormSelection.html(supportedCoinsList[coinsSelectedToAdd[0]].name + templates.all.repeaters.coinSelectionShowItem.replace('{{ item }}', coinsSelectedToAdd[0].toUpperCase()));
          $('.btn-signin').removeClass('disabled');
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
}]);