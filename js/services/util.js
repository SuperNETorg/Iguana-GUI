'use strict';

angular.module('IguanaGUIApp')
.service('util', [
  '$storage',
  '$uibModal',
  '$rootScope',
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
  function($storage, $uibModal, $rootScope, $timeout, $interval,
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

    this.getCoinKeys = function(coins) {
      var result = [];

      for (var i = 0; coins.length > i; i++) {
        result.push(coins[i].coinId);
      }

      return result;
    };

    this.execCommandCopy = function(element, elementDisplayName) {

      if (!this.isExecCopyFailed) {
        var message,
            color,
            temp = angular.element('<input>');
        elementDisplayName = (elementDisplayName ? elementDisplayName : '');

        if (element[0] instanceof HTMLElement) {
          element = element.text();
        }

        angular.element(document.body).append(temp);
        temp[0].value = element;
        temp[0].select();

        try {
          document.execCommand('copy');

          message = elementDisplayName + ' ' +
            $filter('lang')('MESSAGE.COPIED_TO_CLIPBOARD') + ' </br>"' + element + '" ';
          color = 'blue';
        } catch (e) {
          this.isExecCopyFailed = true;
          message = $filter('lang')('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED');
          color = 'red';
        }

        temp.remove();
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

    // native javascript
    this.getElementOffset = function(element) {
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
          coin = document.querySelectorAll('.coins')[0],
          width,
          padding;

      if (mainContent && txUnit) {
        // tx unit resize
        if (!self.isMobile()) {
          width = Math.floor(mainContent.offsetWidth - coin.offsetWidth - 80);
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