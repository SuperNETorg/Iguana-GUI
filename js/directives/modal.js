angular.module('IguanaGUIApp')
.directive('uimodal', [
  '$uibModal',
  '$uibModalStack',
  'util',
  function($uibModal, $uibModalStack, util) {
    var activeModal = 0;

    return {
      scope: true,
      link: function(scope, element, attr) {
        var open = $uibModalStack.open,
            close = $uibModalStack.close,
            dismiss = $uibModalStack.dismiss;

        scope.modal = {
          flowModal: {
            animation: true,
            ariaLabelledBy: 'modal-title',
            size: 'full',
            ariaDescribedBy: 'modal-body',
            controller: 'flowModalController',
            templateUrl: 'partials/flow.html',
            appendTo: angular.element(document.querySelector('.flow-modal'))
          },
          coinModal: {
            animation: false,
            ariaLabelledBy: 'modal-title',
            size: 'full',
            ariaDescribedBy: 'modal-body',
            controller: 'selectCoinModalController',
            templateUrl: 'partials/add-coin.html',
            appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
          }
        };

        $uibModalStack.open = function(modalInstance, modal) {
          modalInstance.rendered.then(function() {
            if (activeModal === 0) {
              util.bodyBlurOn();
            }

            if (activeModal >= 0) {
              ++activeModal;
            }
          });

          open.apply(open, arguments);
        };

        $uibModalStack.close = function(modalInstance, modal) {
          modalInstance.closed.then(function() {
            if (activeModal > 0) {
              --activeModal;
            }

            if (activeModal === 0) {
              util.bodyBlurOff();
            }
          });

          close.apply(close, arguments);
        };

        $uibModalStack.dismiss = function(modalInstance, modal) {
          modalInstance.closed.then(function() {
            if (activeModal > 0) {
              --activeModal;
            }

            if (activeModal === 0) {
              util.bodyBlurOff();
            }
          });

          dismiss.apply(dismiss, arguments);
        };
      }
    }
  }
]);