'use strict';

angular.module('IguanaGUIApp.controllers')
.filter('decimalPlacesFormat', function () {
  return function(value, type) {
    var valueComponents = value.toString().split('.'),
        decimalPlaces = {
          coin: 0,
          currency: 0
        }

    if (value < 1 && value > 0) {

      for (var i=0; i < valueComponents[1].length; i++) {
        if (Number(valueComponents[1][i]) !== 0) {
          decimalPlaces.coin = i + 2;
          decimalPlaces.currency = decimalPlaces.coin;
          break;
        }
      }
    } else {
      decimalPlaces.coin = settings.decimalPlacesCoin;
      decimalPlaces.currency = settings.decimalPlacesCurrency;
    }

    if (!valueComponents[1]) { // show only the whole number if right part eq zero
      decimalPlaces.coin = decimalPlacesCurrency = 0;
    }

    return value.toFixed(decimalPlaces[type]);
  };
});