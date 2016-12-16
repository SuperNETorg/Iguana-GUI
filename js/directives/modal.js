angular.module('IguanaGUIApp')
.directive('uimodal', function ($document, $uibModal, $uibModalStack) {
  function bodyBlurOn() {
    angular.element(document.body).addClass('modal-open');
  }

  function bodyBlurOff() {
    angular.element(document.body).removeClass('modal-open');
  }

    return {
      link: function () {
        var open = $uibModalStack.open;
        var close = $uibModalStack.close;
        var dismiss = $uibModalStack.dismiss;
        $uibModalStack.open = function (...arguments) {
          bodyBlurOn();
          open.apply(open, arguments);
        };
        $uibModalStack.close = function (...arguments) {
          bodyBlurOff();
          close.apply(close, arguments);
        };
        $uibModalStack.dismiss = function (...arguments) {
          bodyBlurOff();
          dismiss.apply(dismiss, arguments);
        };
      }
    }
  }
);