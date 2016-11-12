'use strict';

var _settings = {
  iguanaPort: '7778',
  proxy: 'http://localhost:1337/', // https://github.com/gr2m/CORS-Proxy
  ratesUpdateTimeout: 15, // sec, see dashboard/rates.js
  ratesUpdateMultiply: 0, // sec
  decimalPlacesCoin: 1,
  decimalPlacesCurrency: 2,
  decimalPlacesTxUnit: 5,
  dashboardUpdateTimout: 15, // sec
  defaultCurrency: 'USD',
  defaultLang: 'EN',
  portPollUpdateTimeout: 60, // sec
  defaultSessionLifetimeIguana: 7200, // sec
  defaultSessionLifetimeCoind: 2629743, // sec, ~1 month
  defaultWalletUnlockPeriod: 3, // sec
  defaultTransactionsCount: 20,
  defaultAccountNameIguana: 'default', // note: change to a specific account name if needed; default coind account name is empty string
  defaultAccountNameCoind: '',
  txUnitProgressStatusMinConf: 10,
  iguanaNullReturnCountThreshold: 30,
  iguanaNullReturnCountLogoutTimeout: 10, // sec
  addCoinInfoModalTimeout: 5, // sec
  addCoinTimeout: 2, // sec
  thresholdTimeAgo: {
    day: 10
  }
};

// create a new object with non-writable values
var settings = {};
for (var key in _settings) {
  Object.defineProperty(settings, key, {
    value: _settings[key],
    writetable: false
  });
}