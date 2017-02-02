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
  '$interval',
  function($q, vars, util, $state, $storage, $sessionStorage,
           $message, $timeout, $rootScope, $interval) {

    vars.error = this;

    var response = {},
        errors = undefined,
        status,
        message = null,
        messageType = true,
        consoleMessage = null,
        isViewAndLogOut = false,
        isShowConsole = dev.showConsoleMessages && dev.isDev;

    vars.response = {};
    $sessionStorage.$message = {};

    return {
      'check': function() {
        vars.response.data = arguments[0];
        status = arguments[0].status;

        if ($storage.isIguana) {
          checkIguanaErrors.apply(this, arguments);
        } else {
          checkNoIguanaErrors.apply(this, arguments);
        }
      },
      'message': message,
      'status': status
    };

    function checkIguanaErrors() {
      response = arguments[0];

      if (response.data) {
        if (response.data.error) {
          errors = response.data.error;
          iguanaErrorsSwitch();
        } else {
          hideErrors();
          $timeout.cancel(vars.noIguanaTimeOut);
        }
      } else if (response.data === null) {
        if (response.status === -1 && response.statusText === '') {
          // if (vars.$auth._userIdentify()) {
          $timeout.cancel(vars.noIguanaTimeOut);
          if (
            !$sessionStorage.$message.active ||
            !$sessionStorage.$message.active['MESSAGE.DAEMONS_ERROR']
          ) {
            vars.noIguanaTimeOut = $timeout(function () {
              messageType = 'logout';
              message = 'DAEMONS_ERROR';
              hideErrors(message);
              $interval.cancel(vars.dashboardUpdateRef);
              viewErrors();
            }, settings.appViewMessageTimeout * 1000);
          }
          // }
          if (isShowConsole) {
            console.log('connection error');
          }
        } else {
          hideErrors();
        }
      } else {
        if (
          $sessionStorage.$message &&
          $sessionStorage.$message.active &&
          $sessionStorage.$message.active.hasOwnProperty($storage.isIguana ? 'MESSAGE.IGUANA_CORE_ERROR' : 'MESSAGE.DAEMONS_ERROR')
        ) {
          if ($sessionStorage.$message.active[$storage.isIguana ? 'MESSAGE.IGUANA_CORE_ERROR' : 'MESSAGE.DAEMONS_ERROR']) {
            $sessionStorage.$message.active[$storage.isIguana ? 'MESSAGE.IGUANA_CORE_ERROR' : 'MESSAGE.DAEMONS_ERROR'].close();
          }

          delete $sessionStorage.$message.active[$storage.isIguana ? 'MESSAGE.IGUANA_CORE_ERROR' : 'MESSAGE.DAEMONS_ERROR'];
        }
        $timeout.cancel(vars.noIguanaTimeOut);
      }

    }

    function checkNoIguanaErrors() {
      response = arguments[0];

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

      if (typeof statusSwich !== 'undefined' && !statusSwich) {
        if (
          errors && errors.message &&
          errors.message.indexOf('connect ECONNREFUSED') !== -1 &&
          (!$storage['connected-coins'] || vars.$auth._userIdentify())
        ) {
          vars.noIguanaTimeOut = $timeout(function() {
            message = 'DAEMONS_ERROR';
            viewErrors();
          }, settings.appViewMessageTimeout * 1000)
        } else if (response.status === -1) {
          vars.noIguanaTimeOut = $timeout(function() {
            message = 'PROXY_ERROR';
            viewErrors();
          }, settings.appViewMessageTimeout * 1000)
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
      $timeout.cancel(vars.iguanaTimeOut);

      switch (errors) {
        case 'need to unlock wallet':
          isViewAndLogOut = true;
          if (!message) {
            message = 'APP_FAILURE';
          }
          if (messageType === true) {
            messageType = 'logout';
          }
          consoleMessage = '';
          status = 10;
          break;
        case 'null return from iguana_bitcoinRPC':
          isViewAndLogOut = true;
          if (response.config.method == 'GET') {
            isViewAndLogOut = false;
          }
          if (
            $sessionStorage.$message.active &&
            $sessionStorage.$message.active['MESSAGE.APP_FAILURE_ALT']
          ) {
            $interval.cancel(vars.dashboardUpdateRef);

            if (!message) {
              message = 'APP_FAILURE_ALT';
            }
          }
          if (messageType === true) {
            messageType = 'logout';
          }
          consoleMessage = 'iguana crashed? attempts: ' + $storage.activeCoin + ' of ' + settings.iguanaNullReturnCountThreshold + ' max';
          status = null;
          break;
        case 'authentication error':
          if (response.config.method == 'GET') {
            isViewAndLogOut = false;
          }
          if (
            $sessionStorage.$message.active &&
            $sessionStorage.$message.active['MESSAGE.AUTHENTICATION_ERROR']
          ) {
            $interval.cancel(vars.dashboardUpdateRef);

            if (!message) {
              message = 'AUTHENTICATION_ERROR';
            }
          }
          if (messageType === true) {
            messageType = 'logout';
          }
          consoleMessage = 'authentication error';
          status = null;
          break;
        case 'iguana jsonstr expired':
          consoleMessage = 'server is busy';
          status = 10;
          break;
        case 'coin is busy processing':
          isViewAndLogOut = false;
          consoleMessage = 'server is busy';
          status = 10;
          break;
        case 'getconnectioncount needs coin':
          if (
            $sessionStorage.$message.active &&
            $sessionStorage.$message.active['MESSAGE.GET_CONNECTION_COUNT']
          ) {
            isViewAndLogOut = false;
          } else {
            isViewAndLogOut = true;
            hideErrors(message)
          }
          $interval.cancel(vars.dashboardUpdateRef);

          isShowConsole = true;
          message = 'GET_CONNECTION_COUNT';

          if (messageType === true) {
            messageType = 'logout';
          }
          break;
        default:
          consoleMessage = 'unknown error';
      }

      if (isViewAndLogOut) {
        vars.iguanaTimeOut = $timeout(function() {
          viewErrors();
        }, settings.appViewMessageTimeout * 1000);
      }

      if (isShowConsole) {
        console.log(consoleMessage);
      }
    }

    function viewErrors() {
      $message.viewErrors('MESSAGE.' + message, messageType);
    }

    function hideErrors(messageKey) {
      var activeMessage;

      if ($sessionStorage.$message &&
          $sessionStorage.$message.active) {
        for (var name in $sessionStorage.$message.active) {
          activeMessage = $sessionStorage.$message.active[name];

          if (messageKey && 'MESSAGE.' + messageKey !== name) {
            activeMessage.close();
          } else {
            vars.iguanaTimeOut = $timeout(function(message) {
              message.close();
            }.bind(null, activeMessage), settings.appViewMessageTimeout * 1000);
          }
        }
      }
    }
  }
]);