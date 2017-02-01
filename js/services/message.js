'use strict';

angular.module('IguanaGUIApp')
.service('$message', [
  '$uibModal',
  '$rootScope',
  '$filter',
  '$sessionStorage',
  'vars',
  '$state',
  function($uibModal, $rootScope, $filter, $sessionStorage, vars, $state) {
    vars.$message = this;

    this.ngPrepMessageModal = function(message, color, messageType) {
      $rootScope.messageType = messageType; // TODO: rewrite
      $rootScope.message = message;

      return $uibModal.open({
        animation: true,
        backdrop: true, //messageType ? false : true,
        keyboard: true, //messageType ? false : true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        scope: $rootScope,
        controller: 'messageController',
        windowClass: 'iguana-modal message-container msg-' + color,
        templateUrl: 'partials/message-modal.html'
      });
    };

    this.ngPrepMessageNoDaemonModal = function() {
      this.ngPrepMessageModal(null, 'red', 'noDaemon');
    };

    this.viewErrors = function(message, type) {
      var inLogin = $state.current.name.indexOf('login') != -1,
        inSignup = $state.current.name.indexOf('signup') != -1,
        inAuth = (inLogin || inSignup);

      if (!$sessionStorage.$message) {
        $sessionStorage.$message = {}
      }

      if (!$sessionStorage.$message.active) {
        $sessionStorage.$message.active = {};
      }

      if (!$sessionStorage.$message.active[message]) {
        if (type === 'logout' && inAuth) {
          return;
        }
        $sessionStorage.$message.active[message] = this.ngPrepMessageModal($filter('lang')(message), 'red', type);
      }

      $sessionStorage.$message.active[message].closed.then(function() {
        delete $sessionStorage.$message.active[message];
      })
    }
  }
]);