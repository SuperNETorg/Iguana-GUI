/* Iguana/services/bootstrap */
'use strict';
angular.module('IguanaGUIApp')
.controller('addCoinModalController', [
  '$scope',
  '$uibModalInstance',
  'util',
  '$api',
  '$storage',
  '$rootScope',
  '$timeout',
  'vars',
  '$q',
  function ($scope, $uibModalInstance, util, $api, $storage, $rootScope, $timeout, vars, $q) {
    $scope.isIguana = $storage['isIguana'];
    $scope.open = open;
    $scope.close = close;
    $scope.next = next;
    $scope.alouNext = false;
    $scope.util = util;
    $scope.clickOnCoin = clickOnCoin;
    $scope.coinSearchModel = undefined;
    $scope.coinsSelectedToAdd = {coins: getSelectedCoins()};
    $scope.availableCoins = constructCoinRepeater(vars.coinsInfo);

    function getSelectedCoins() {
      var result = [];

      if ($storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'].map(function (el) {
          result.push(Object.keys(el)[0]);
        });
      }
      return result;
    }

    function constructCoinRepeater(coinsInfo) {
      var index = 0,
          addCoinArray = [],
          coinColors = [
            'orange',
            'breeze',
            'light-blue',
            'yellow'
          ];

      if (undefined !== coinsInfo) {
        for (var key in supportedCoinsList) {
          if (( !$storage['iguana-' + key + '-passphrase'] || (
            $storage['iguana-' + key + '-passphrase'] &&
            $storage['iguana-' + key + '-passphrase'].logged !== 'yes' ))) {
            if (($storage['isIguana'] && coinsInfo[key].iguana === true) ||
              (!$storage['isIguana'] && coinsInfo[key].connection === true)
            ) {
              addCoinArray.push({
                'id': key.toUpperCase(),
                'coinId': key.toLowerCase(),
                'name': supportedCoinsList[key].name,
                'color': coinColors[index]
              });
              if (index === coinColors.length - 1) {
                index = 0;
              } else {
                index++;
              }
            }
          }
        }
      }

      return addCoinArray;
    }

    function clickOnCoin(item, $event) {
      var coinDomElement = angular.element($event.currentTarget),
          isDisable = false,
          activeCoinStorageData = {};

      $scope.coinsSelectedToAdd.coins.map(function (el, id) {
        if (el == item.coinId) {
          $scope.coinsSelectedToAdd.coins.splice(id, 1);
          coinDomElement.removeClass('active');
          isDisable = true;
        }
      });

      if (!$storage['isIguana']) {
        $scope.coinsSelectedToAdd.coins = [];
      }

      if (!isDisable && !$scope.coinsSelectedToAdd.coins[item.coinId]) {
        $scope.coinsSelectedToAdd.coins.push(item.coinId);
        coinDomElement.addClass('active');
      }

      if (!$storage['iguana-login-active-coin']) {
        $storage['iguana-login-active-coin'] = [];
      } else {
        $storage['iguana-login-active-coin'].map(function (el, id) {
          if (Object.keys(el)[0] == item.coinId) {
            $storage['iguana-login-active-coin'].splice(id, 1);
          }
        });
      }
      activeCoinStorageData[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]] = '';
      // dev only
      if (dev.isDev && !$scope.isIguana && dev.coinPW.coind[$scope.coinsSelectedToAdd.coins[0]]) {
        activeCoinStorageData[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]] =
          dev.coinPW.coind[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]];
      }

      if (dev.isDev && $scope.isIguana && dev.coinPW.iguana) {
        activeCoinStorageData[$scope.coinsSelectedToAdd.coins[$scope.coinsSelectedToAdd.coins.length - 1]] = dev.coinPW.iguana;
      }

      if (!isDisable && $storage['iguana-login-active-coin'].indexOf(activeCoinStorageData) == -1) {
        $storage['iguana-login-active-coin'].push(activeCoinStorageData);
      }
    }

    function checkIguanaCoinsSelection(suppressAddCoin) {
      var result = false,
        selectedCoins = 0,
        defer = $q.defer();
      $scope.coinsSelectedToAdd.coins = util.reindexAssocArray($scope.coinsSelectedToAdd.coins);

      if (!suppressAddCoin) {
        var addCoinResponses = [];

        for (var key in vars.coinsInfo) {
          $storage['iguana-' + key + '-passphrase'] = {' logged': 'no' };
        }
        // for (var i = 0; i < $scope.coinsSelectedToAdd.length; i++) {
        //   if ($scope.coinsSelectedToAdd[i]) {
        //     selectedCoins++;
        $timeout(function () {
          $api.addCoin($scope.coinsSelectedToAdd.coins, 0).then(onResolve);
        });
          // }
          // if (selectedCoins > 0) {
          //   result = true;
          // }
        // }
      } else {
        defer.resolve(true);
      }

      function onResolve(attr) {
        var response = attr[0],
          coin = attr[1];
        if (response === 'coin added' || response === 'coin already there') {
          if (dev.isDev && dev.showSyncDebug) $('#debug-sync-info').append(coin + ' coin added<br/>');
          addCoinResponses.push({ 'coin': coin, 'response': response });
          coinsInfo[coin].connection = true; // update coins info obj prior to scheduled port poll
        }

        var addedCoinsOutput = '',
          failedCoinsOutput = '<br/>';
        for (var i = 0; i < Object.keys(addCoinResponses).length; i++) {
          if (addCoinResponses[i].response === 'coin added' || addCoinResponses[i].response === 'coin already there') {
            addedCoinsOutput = addedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
            localstorage.setVal('iguana-' + addCoinResponses[i].coin + '-passphrase', { 'logged': 'yes' });
          } else {
            failedCoinsOutput = failedCoinsOutput + addCoinResponses[i].coin.toUpperCase() + ', ';
          }
        }

        addedCoinsOutput = helper.trimComma(addedCoinsOutput);
        failedCoinsOutput = helper.trimComma(failedCoinsOutput);
        helper.prepMessageModal(addedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P1') + (failedCoinsOutput.length > 7 ? failedCoinsOutput + ' ' + helper.lang('MESSAGE.COIN_ADD_P2') : '') + (Object.keys(addCoinResponses).length === selectedCoins ? '<br/>' + helper.lang('MESSAGE.REDIRECTING_TO_DASHBOARD') + '...' : ''), 'green', true);

        if (Object.keys(addCoinResponses).length === selectedCoins) {
          // since there's no error on nonexistent wallet passphrase in Iguana
          // redirect to dashboard with 5s timeout
          // TODO(?): point out if a coin is already running
          setTimeout(function () {
            addAccountIguanaCoind(buttonClassNameCB);
          }, settings.addCoinInfoModalTimeout * 1000);
        }
      }

      return defer.promise;
    }

    function close() {
      $uibModalInstance.dismiss();
    }

    function next() {
      if ($storage['isIguana']) {
        checkIguanaCoinsSelection(false)
        .then(function () {
          $uibModalInstance.close()
        });
      } else {
        $uibModalInstance.close();
      }
    }
  }
]);