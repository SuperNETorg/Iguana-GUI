'use strict';

angular.module('IguanaGUIApp')
.service('util', [
  '$storage',
  '$uibModal',
  '$rootScope',
  'clipboard',
  '$timeout',
  '$interval',
  '$http',
  '$q',
  '$document',
  '$state',
  '$filter',
  '$message',
  '$localStorage',
  function($storage, $uibModal, $rootScope, clipboard, $timeout, $interval, $http, $q, $document, $state, $filter,$message, $localStorage) {
    var self = this;

    this.isIguana = $storage['isIguana'];
    this.defaultSessionLifetime = 0;
    this.portPollUpdateTimeout = settings.portPollUpdateTimeout;
    this.coindWalletLockResults = [];
    this.isExecCopyFailed = false;
    this.coindWalletLockCount = 0;
    this.minEpochTimestamp = 1471620867; // Jan 01 1970

    this.reindexAssocArray = function(array) {
      var _array = [];

      for (var i = 0; array.length > i; i++) {
        if (array[i]) _array.push(array[i]);
      }

      return _array;
    };

    this.addCopyToClipboardFromElement = function(element, elementDisplayName) { // TODO: move to signup controller
      if (!this.isExecCopyFailed) {
        try {
          clipboard.copyText(element.html());
          $message.ngPrepMessageModal( // TODO
            elementDisplayName + ' ' + $filter('lang')('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + element.html(),
            'blue',
            true
          );
        } catch (e) {
          this.isExecCopyFailed = true;
          this.ngPrepMessageModal($filter('lang')('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED'), 'red', true);
        }
      }
    };

    this.trimComma = function(str) {
      if (str[str.length - 1] === ' ') {
        str = str.replace(/, $/, '');
      }
      if (str[str.length - 1] === ',') {
        str = str.replace(/,$/, '');
      }

      return str;
    };

    this.isMobile = function() {
      var widthThreshold = 768; // px

      if ($(window).width <= widthThreshold)
        return true;
      else
        return false;
    };

    this.initTopNavBar = function() {
      if ($(window).width() < 768) {
        var topMenu = $('#top-menu'),
            btnLeft = $('.nav-buttons .nav-left', topMenu),
            btnRight = $('.nav-buttons .nav-right', topMenu),
            items = $('.item', topMenu), itemsLength = 0, item;

        btnLeft.on('click swipeleft', function() {
          if ($(window).width() < $('.top-menu', topMenu).width()) {
            itemsLength = $('.top-menu', topMenu).width();
            for (var i = items.length - 1; 0 <= i; i--) {
              item = $(items[i]);
              itemsLength -= $(items[i]).width();
              if ($(items[i]).offset().left + $(items[i]).width() < $('.top-menu', topMenu).width() && itemsLength > $(items[i]).width()) {
                item.closest('.navbar-nav').animate({'margin-left':
                parseFloat(item.closest('.navbar-nav').css('margin-left')) + $(items[i]).width()}, "slow");
                itemsLength = 0;
                break;
              } else {
                return;
              }
            }
          }
        });
        btnRight.on('click swiperight', function() {
          if ($(window).width() < $('.top-menu', topMenu).width())
            for (var i = 0; items.length > i; i++) {
              item = $(items[i]);
              itemsLength += $(items[i]).offset().left;
              if ($(items[i]).offset().left < topMenu.width() && itemsLength > topMenu.width()) {
                item.closest('.navbar-nav').animate({'margin-left':
                  (parseFloat(item.closest('.navbar-nav').css('margin-left')) - $(items[i]).width())}, "slow");
                itemsLength = 0;
                break;
              }
            }
        });
      }
    };

    // not the best solution but it works
    this.applyDashboardResizeFix = function(coins) {
      var mainContent = $('.main-content'),
          txUnit = $('.transactions-unit');

      // tx unit resize
      if ($(window).width() > 767) {
        var width = Math.floor(mainContent.width() - $('.coins').width() - 80);
        mainContent.css({ 'padding': '0 30px' });
        txUnit.css({
          'max-width': width,
          'width': width
        });
      } else {
        txUnit.removeAttr('style');
        mainContent.removeAttr('style');
      }

      // coin tiles on the left
      if (coins) {
        var accountCoinsRepeaterItem = '.account-coins-repeater .item';

        for (var i=0; i < coins.length; i++) {
          var coin = coins[i].id;

          $(accountCoinsRepeaterItem + '.' + coin + ' .coin .name').css({ 'width': Math.floor($(accountCoinsRepeaterItem + '.' + coin).width() -
                                                                                              $(accountCoinsRepeaterItem + '.' + coin + ' .coin .icon').width() -
                                                                                              $(accountCoinsRepeaterItem + '.' + coin + ' .balance').width() - 50) });
        }
      }
    };

    this.constructCoinRepeater = function(coinsInfo) {
      var index = 0,
        addCoinColors = ['orange', 'breeze', 'light-blue', 'yellow'],
        addCoinArray = new Array;

      for (var key in supportedCoinsList) {
        if (
          (!$localStorage['iguana-' + key + '-passphrase'] ||
          ($localStorage['iguana-' + key + '-passphrase'] &&
          $localStorage['iguana-' + key + '-passphrase'].logged !== 'yes')) ||
          $state.current.name === 'login' ||
          $state.current.name === 'create-account'
        ) {
          if (
            ($localStorage['isIguana'] && coinsInfo[key].iguana !== false) ||
            (!$localStorage['isIguana'] && coinsInfo[key].connection === true)
          ) {
            addCoinArray.push({
              'id': key.toUpperCase(),
              'coinId': key.toLowerCase(),
              'name': supportedCoinsList[key].name,
              'color': addCoinColors[index]
            });
            if (index === addCoinColors.length - 1) index = 0;
            else index++;
          }
        }
      }

      return addCoinArray;
    }
  }
]);