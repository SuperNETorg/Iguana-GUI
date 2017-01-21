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
            animation: scope.isIguana ? true : false,
            ariaLabelledBy: 'modal-title',
            size: 'full',
            ariaDescribedBy: 'modal-body',
            controller: 'selectCoinModalController',
            templateUrl: 'partials/add-coin.html',
            appendTo: angular.element(document.querySelector('.auth-add-coin-modal'))
          },
          sendCoinModal: {
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            size: 'lg',
            controller: 'sendCoinModalController',
            templateUrl: 'partials/send-coin.html',
            appendTo: angular.element(document.querySelector('.send-coin-modal-container'))
          },
          receiveCoinModal: {
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            size: 'lg',
            controller: 'receiveCoinModalController',
            templateUrl: 'partials/receive-coin.html',
            appendTo: angular.element(document.querySelector('.receive-coin-modal-container'))
          },
          sendCoinPassphraseModal: {
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            controller: 'sendCoinPassphraseModalController',
            templateUrl: 'partials/send-coin-passphrase.html',
            appendTo: angular.element(document.querySelector('.send-coin-passphrase-modal-container')),
            resolve: {
              receivedObject: function() {
                return $scope.receivedObject;
              }
            }
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