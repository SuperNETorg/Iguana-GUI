'use strict';

angular.module('IguanaGUIApp')
.service('util', [
  '$window',
  '$filter',
  '$message',
  function($window, $filter, $message) {

    var self = this;

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
        if (coins[i].coinId)
          result.push(coins[i].coinId);
      }

      return result;
    };

    this.execCommandCopy = function(element, elementDisplayName) {
      if (!this.isExecCopyFailed) {
        var message,
            color,
            temp = angular.element('<input>');

        elementDisplayName = elementDisplayName ? elementDisplayName : '';

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
        } catch(e) {
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
      return $window.innerWidth < 768;
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
  }
]);