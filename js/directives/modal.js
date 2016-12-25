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

        $uibModalStack.open = function(modalInstance, modal) {
          modalInstance.rendered.then(function() {
            if (activeModal === 0 && !util.isMobile) {
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