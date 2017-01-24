'use strict';

angular.module('IguanaGUIApp')
.service('error', [
  '$q',
  'vars',
  'util',
  '$state',
  '$storage',
  '$sessionStorage',
  '$message',
  '$timeout',
  '$rootScope',
  function($q, vars, util, $state, $storage, $sessionStorage,
           $message, $timeout, $rootScope) {

    vars.error = this;

    var isIguana = $storage.isIguana,
        response = {},
        errors = undefined,
        status,
        message = null,
        consoleMessage = null,
        isViewAndLogOut = false,
        isShowConsole = dev.showConsoleMessages && dev.isDev;

    vars.response = {};

    $rootScope.$on('connectionFiled', function () {
      isViewAndLogOut = isShowConsole = true;
      message = 'APP_FAILURE';
      consoleMessage = '';
      iguanaErrorsSwitch();
    });

    return {
      'check': function(...args) {
        vars.response.data = args[0];
        if (isIguana) {
          checkIguanaErrors.apply(this, args);
        } else {
          checkNoIguanaErrors.apply(this, args);
        }
      },
      'message': message,
      'status': status
    };

    function checkIguanaErrors(...args) {
      response = args[0];

      if (response.data) {
        if (response.data.error) {
          errors = response.data.error;
          iguanaErrorsSwitch();
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

      if (response.data) {
        errors = response.data;
        if (response.data.error) {
          noIguanaErrorSwich();
        } else {
          noIguanaErrorSwich(!!response.data);
        }
      } else {
        noIguanaErrorSwich(!!response.data);
      }
    }

    function noIguanaErrorSwich(statusSwich) {
      $timeout.cancel(vars.noIguanaTimeOut);

      if (!statusSwich) {
        if (
          errors && errors.message &&
          errors.message.indexOf('connect ECONNREFUSED') !== -1 &&
          (!$storage['connected-coins'] || vars.$auth._userIdentify())
        ) {
          vars.noIguanaTimeOut = $timeout(function () {
            message = 'DAEMONS_ERROR';
            viewOrHide();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000)
        } else if (response.status === -1) {
          vars.noIguanaTimeOut = $timeout(function () {
            message = 'PROXY_ERROR';
            viewOrHide();
          }, settings.iguanaNullReturnCountLogoutTimeout * 1000)
        }
      } else {
        if (
          $sessionStorage.$message &&
          $sessionStorage.$message.active
        ) {
          if (
            (
              $sessionStorage.$message.active.hasOwnProperty('MESSAGE.PROXY_ERROR') ||
              $sessionStorage.$message.active.hasOwnProperty('MESSAGE.DAEMONS_ERROR')
            ) &&
            response.status !== -1 && response.config.url.indexOf(':1337') !== -1
          ) {
            if ($sessionStorage.$message.active['MESSAGE.PROXY_ERROR']) {
              $sessionStorage.$message.active['MESSAGE.PROXY_ERROR'].close();
            }
            if ($sessionStorage.$message.active['MESSAGE.DAEMONS_ERROR']) {
              $sessionStorage.$message.active['MESSAGE.DAEMONS_ERROR'].close();
            }

            delete $sessionStorage.$message.active['MESSAGE.PROXY_ERROR'];
            delete $sessionStorage.$message.active['MESSAGE.DAEMONS_ERROR'];
          }
        }
      }
    }

    function iguanaErrorsSwitch() {
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
        case 'getconnectioncount needs coin':
          isShowConsole = isViewAndLogOut = false;
          break;
        default :
          consoleMessage = 'default error';
      }

      if (isViewAndLogOut) {
        viewOrHide();
      }
      if (isShowConsole) {
        console.log(consoleMessage);
      }
    }

    function viewOrHide() {
      if ($state.current.name !== 'login') {
          $message.viewErrors('MESSAGE.' + message);
      }
    }
  }
]);