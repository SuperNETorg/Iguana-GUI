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
  '$window',
  '$state',
  '$filter',
  '$message',
  '$localStorage',
  function($storage, $uibModal, $rootScope, clipboard, $timeout, $interval,
           $http, $q, $document, $window, $state, $filter, $message) {

    var self = this;

    this.isIguana = $storage['isIguana'];
    this.defaultSessionLifetime = 0;
    this.portPollUpdateTimeout = settings.portPollUpdateTimeout;
    this.coindWalletLockResults = [];
    this.isExecCopyFailed = false;
    this.coindWalletLockCount = 0;
    this.minEpochTimestamp = 1471620867; // Jan 01 1970

    this.bodyBlurOn = function() {
      angular.element(document.body).addClass('modal-open');
    };

    this.bodyBlurOff = function() {
      angular.element(document.body).removeClass('modal-open');
    };

    this.reindexAssocArray = function(object) {
      var _array = [],
          _index = 0,
          item;

      for (var name in object) {
        item = object[name];

        if (!_array[_index]) {
          _array.push(item);
        }
        ++_index;
      }

      return _array;
    };

    this.getCoinKeys = function (coins) {
      var result = [];

      for (var i = 0; coins.length > i ;i++) {
        result.push(coins[i].coinId);
      }

      return result;
    };

    this.addCopyToClipboardFromElement = function(element, elementDisplayName) {
      // TODO: move to signup controller
      if (!this.isExecCopyFailed) {
        var message,
            color;

        try {
          clipboard.copyText(element.html());
          message = elementDisplayName + ' ' +
            $filter('lang')('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + element.html();
          color = 'blue';
        } catch (e) {
          this.isExecCopyFailed = true;
          message = $filter('lang')('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED');
          color = 'red';
        }

        $message.ngPrepMessageModal(message, color);
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
      return $window.innerWidth < 768
    };

    this.initTopNavBar = function() {
      var topMenu = angular.element(document.getElementById('top-menu'));

      angular.element(document.body).bind("scroll", function() {
        if (self.isMobile()) {
          if (self.getElementOffset(document.querySelectorAll('.main-content, .currency-content')[0]).top  < -270) {
            topMenu.addClass('hidden');
          } else {
            topMenu.removeClass('hidden');
          }
        }
      });

      if (self.isMobile()) {
        var btnLeft = $('.nav-buttons .nav-left', topMenu),
            btnRight = $('.nav-buttons .nav-right', topMenu),
            items = $('.item', topMenu),
            itemsLength = 0,
            item;

        btnLeft.on('click swipeleft', function() {
          if ($(window).width() < $('.top-menu', topMenu).width()) {
            itemsLength = $('.top-menu', topMenu).width();

            for (var i = items.length - 1; 0 <= i; i--) {
              item = $(items[i]);
              itemsLength -= $(items[i]).width();

              if ($(items[i]).offset().left + $(items[i]).width() < $('.top-menu', topMenu).width() &&
                itemsLength > $(items[i]).width()) {
                item.closest('.navbar-nav')
                  .animate({
                    'margin-left': parseFloat(item.closest('.navbar-nav').css('margin-left')) + $(items[i]).width()
                  }, 'slow');
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

              if ($(items[i]).offset().left < topMenu.width() &&
                itemsLength > topMenu.width()) {
                item.closest('.navbar-nav')
                  .animate({
                    'margin-left': (parseFloat(item.closest('.navbar-nav').css('margin-left')) - $(items[i]).width())
                  }, 'slow');
                itemsLength = 0;
                break;
              }
            }
        });
      }
    };

    // native javascript
    this.getElementOffset = function (element) {
      var docEl = document.documentElement,
          boundClientRect = element.getBoundingClientRect();

      return {
        top: boundClientRect.top + window.pageYOffset - docEl.clientTop,
        left: boundClientRect.left + window.pageXOffset - docEl.clientLeft
      };
    };

    // not the best solution but it works
    this.applyDashboardResizeFix = function(coins) {
      var mainContent = document.querySelectorAll('.main-content')[0],
          txUnit = document.querySelectorAll('.transactions-unit')[0],
          width,
          padding;

      if (mainContent && txUnit) {
        // tx unit resize
        if (!self.isMobile()) {
          width = Math.floor(mainContent.offsetWidth - $('.coins').width() - 80);
          padding = '0 30px';
        } else {
          width = '';
          padding = '';
        }
      }

      txUnit.style.maxWidth = width;
      txUnit.style.width = width;
      mainContent.style.padding = padding;

      // coin tiles on the left
      if (coins.length) {
        var accountCoinsRepeaterItem = '.account-coins-repeater .item',
          coin,
          coinEl;
        for (var i=0; i < coins.length; i++) {
          coin = coins[i].id;
          coinEl = document.querySelector(accountCoinsRepeaterItem + '.' + coin + ' .coin .name');

          if (coinEl) {
            coinEl.style.width = Math.floor(
              document.querySelector(accountCoinsRepeaterItem + '.' + coin).offsetWidth -
              document.querySelector(accountCoinsRepeaterItem + '.' + coin + ' .coin .icon') -
              document.querySelector(accountCoinsRepeaterItem + '.' + coin + ' .balance') - 50
            );
          }
        }
      }
    };
  }
]);