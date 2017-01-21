'use strict';

angular.module('IguanaGUIApp')
.service('error', [
  '$q',
  'vars',
  'util',
  '$state',
  '$storage',
  '$message',
  '$timeout',
  function($q, vars, util, $state, $storage, $message, $timeout) {

    var isIguana = $storage.isIguana,
        response = {},
        errors = undefined,
        status,
        message = null,
        consoleMessage = null,
        isViewAndLogOut = false,
        istypeConsole = false,
        isShowConsole = dev.showConsoleMessages && dev.isDev;

    vars.response = {};

    return {
      'check': function(...args) {
        vars.response.data = args[0];
        if (isIguana) {
          checkIguanaErrors.apply(this, args);
        } else {
          checkNoIguanaErrors.apply(this, args);
        }
      },
      'status': status
    };

    function checkIguanaErrors(...args) {
      response = args[0];

      if (response.data) {
        if (response.data.error) {
          errors = response.data.error;
          errorsSwitch();
        }
      } else if (response.data === null) {
        if (response.status === -1 && response.statusText === '') {
          if (isShowConsole) {
            console.log('connection error');
          }
        }
      }

    }

    function checkNoIguanaErrors(...args) {
      response = args[0];
    }

    function errorsSwitch() {
      switch (errors) {
        case 'need to unlock wallet':
          isViewAndLogOut = true;
          message = 'APP_FAILURE';
          consoleMessage = '';
          status = 10;
          break;
        case 'null return from iguana_bitcoinRPC':
          isViewAndLogOut = true;
          message = 'APP_FAILURE_ALT';
          consoleMessage = 'iguana crashed? attempts: ' + $storage.activeCoin + ' of ' + settings.iguanaNullReturnCountThreshold + ' max';
          status = null;
          break;
        case 'authentication error':
          isViewAndLogOut = true;
          message = 'AUTHENTICATION_ERROR';
          consoleMessage = 'authentication error';
          status = null;
          break;
        case 'iguana jsonstr expired':
          consoleMessage = 'server is busy';
          status = 10;
          break;
        case 'coin is busy processing':
          consoleMessage = 'server is busy';
          status = 10;
          break;
        default :
          consoleMessage = 'default error';
      }

      if (isViewAndLogOut) {
        viewAndLogOut();
      }
      if (isShowConsole) {
        console.log(consoleMessage);
      }
    }

    function viewAndLogOut() {
      $timeout(function() {
        $message.viewErrors('MESSAGE.' + message);
        util.removeStorageItems([
          'passphrase',
          'coin',
          'Coin',
          'fee',
          'pass',
          'rate',
          'auth'
        ]);
        $state.go('login');
      }, settings.iguanaNullReturnCountLogoutTimeout * 1000);
    }

    /*function applyIntervalChecks() {

    }*/
  }
]);