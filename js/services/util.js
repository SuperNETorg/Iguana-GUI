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
  function($storage, $uibModal, $rootScope, clipboard, $timeout, $interval, $http, $q, $document, $state, $filter,$message) {
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
  }
]);