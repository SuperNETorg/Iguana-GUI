'use strict';

angular.module('IguanaGUIApp')
.controller('topMenuController', [
  '$scope',
  '$state',
  '$auth',
  'util',
  '$window',
  function($scope, $state, $auth, util, $window) {
    $scope.$state = $state;
    $scope.$auth = $auth;
    $scope.navbarStyle = { 'margin-left': 0 };

    var element,
        item,
        bundClRect,
        topMenu = document.querySelector('#top-menu'),
        itemsParent = topMenu.querySelector('.top-menu'),
        items = topMenu.querySelectorAll('.item');

    angular.element(document.body).bind('scroll', function() {
      if ($scope.isMobile) {
        element = document.querySelectorAll('.main-content, .currency-content');
        if (util.getElementOffset(element[0]).top  < -270) {
          angular.element(topMenu).addClass('hidden');
        } else {
          angular.element(topMenu).removeClass('hidden');
        }
      }
    });

    $scope.clickLeft = function() {
      if ($scope.isMobile) {
        if (window.innerWidth < itemsParent.offsetWidth) {
          for (var i = 0; items.length > i; i++) {
            bundClRect = items[i].getBoundingClientRect();

            if (parseInt($scope.navbarStyle['margin-left'].replace('px', '')) < 0) {
              $scope.navbarStyle = {
                'margin-left': parseInt($scope.navbarStyle['margin-left'].replace('px', '')) - (bundClRect.left) + 'px'
              };

              break;
            }
          }
        }
      }
    };

    $scope.clickRight = function() {
      if ($scope.isMobile) {
        if (window.innerWidth < itemsParent.offsetWidth) {
          for (var i = items.length - 1; 0 <= i; i--) {
            bundClRect = items[i].getBoundingClientRect();

            if (bundClRect.right > window.innerWidth) {
              $scope.navbarStyle = {
                'margin-left': parseInt($scope.navbarStyle['margin-left'].replace('px', '')) - (bundClRect.width) + 'px'
              };

              break;
            }
          }
        }
      }
    };

    $scope.getNavbarStyle = function() {
      return $scope.navbarStyle;
    };

    $scope.clickOnEasyDEX = $auth.loginEasyDEX;

    $scope.enabled = $auth.checkSession(true);
  }
]);