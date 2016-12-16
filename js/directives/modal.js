angular.module('IguanaGUIApp')
.directive('uimodal', function($document, $uibModal, $uibModalStack) {
  var activeModal = 0;

  function bodyBlurOn() {
    angular.element(document.body).addClass('modal-open');
  }

  function bodyBlurOff() {
    angular.element(document.body).removeClass('modal-open');
  }

  return {
    link: function() {
      var open = $uibModalStack.open,
          close = $uibModalStack.close,
          dismiss = $uibModalStack.dismiss;

      $uibModalStack.open = function(...arguments) {
        if (activeModal === 0) {
          bodyBlurOn();
        }

        if (activeModal >= 0) {
          ++activeModal;
        }

        open.apply(open, arguments);
      };

      $uibModalStack.close = function(...arguments) {
        if (activeModal > 0) {
          --activeModal;
        }

        if (activeModal === 0) {
          bodyBlurOff();
        }

        close.apply(close, arguments);
      };

      $uibModalStack.dismiss = function(...arguments) {
        if (activeModal > 0) {
          --activeModal;
        }

        if (activeModal === 0) {
          bodyBlurOff();
        }

        dismiss.apply(dismiss, arguments);
      };
    }
  }
});