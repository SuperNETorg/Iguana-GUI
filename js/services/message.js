'use strict';

angular.module('IguanaGUIApp')
.service('$message', [
  '$uibModal',
  '$rootScope',
  function ($uibModal, $rootScope) {
    this.ngPrepMessageModal = function(message, color, messageType) {
      $rootScope.messageType = messageType; // TODO: rewrite
      $rootScope.message = message;
      $rootScope.messageColor = color;

      return $uibModal.open({
        animation: true,
        backdrop: messageType ? false : true,
        keyboard : messageType ? false : true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        scope: $rootScope,
        controller: 'messageController',
        windowClass: 'iguana-modal message-container',
        templateUrl: 'partials/message-modal.html'
      });
    };

    this.ngPrepMessageNoDaemonModal = function() {
      this.ngPrepMessageModal(null, null, 'noDaemon');
    };
  }
]);