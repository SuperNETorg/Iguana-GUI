angular.module('IguanaGUIApp')
.directive('uimodal', function($document, $window, $uibModal, $uibModalStack) {
  var activeModal = 0;
  function bodyBlurOn() {
    angular.element(document.body).addClass('modal-open');
  }
  function bodyBlurOff() {
    angular.element(document.body).removeClass('modal-open');
  }

  return {
    scope: true,
    link: function(scope, element, attr) {
      var open = $uibModalStack.open,
          close = $uibModalStack.close,
          dismiss = $uibModalStack.dismiss;
      $uibModalStack.open = function(modalInstance, modal) {
        modalInstance.rendered.then(function () {
          if (activeModal === 0 && $window.innerWidth > 768) {
            bodyBlurOn();
          }

          if (activeModal >= 0) {
            ++activeModal;
          }
        });

        open.apply(open, arguments);
      };

      $uibModalStack.close = function(modalInstance, modal) {
        modalInstance.closed.then(function () {
          if (activeModal > 0) {
            --activeModal;
          }

          if (activeModal === 0) {
            bodyBlurOff();
          }
        });

        close.apply(close, arguments);
      };

      $uibModalStack.dismiss = function(modalInstance, modal) {
        modalInstance.closed.then(function () {
          if (activeModal > 0) {
            --activeModal;
          }

          if (activeModal === 0) {
            bodyBlurOff();
          }
        });

        dismiss.apply(dismiss, arguments);
      };
    }
  }
});