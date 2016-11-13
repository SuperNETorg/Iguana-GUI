'use strict';

angular.module('IguanaGUIApp')
.service('$message', ['$uibModal', function ($uibModal) {
  this.ngPrepMessageModal = function(message, color) {
    $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      windowClass: 'iguana-modal message-container msg-' + color,
      template: '<div class="modal-header msgbox-header">' +
                  '<div class="msg-body" data-dismiss="modal">' + message + '</div>' +
                '</div>',
      resolve: {
        items: function () {
        }
      }
    });
  };
}]);