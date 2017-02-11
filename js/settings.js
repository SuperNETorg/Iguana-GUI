'use strict';

var _settings = {
  iguanaPort: '7778',
  proxy: 'http://127.0.0.1:1337/', // https://github.com/gr2m/CORS-Proxy
  ratesUpdateTimeout: 15, // sec, see services/rates.js
  ratesUpdateMultiply: 0, // sec
  decimalPlacesCoin: 1,
  decimalPlacesCurrency: 2,
  decimalPlacesTxUnit: 5,
  maxDecimalPlacesLimit: 8,
  dashboardUpdateTimeout: 15, // sec, deprecated
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
  iguanaNullReturnCountLogoutTimeout: 1, // sec
  addCoinInfoModalTimeout: 5, // sec
  addCoinTimeout: 2, // sec
  thresholdTimeAgo: {
    day: 10
  },
  defaultRelayFee: 0.00001,
  apiCheckTimeout: 10, // sec
  messageHideTimeout: 3, // sec
  newAddedCoinViewTimeout: 20, // sec
  appRedirectTimeout: 1,
  appViewMessageTimeout: 3,
  defaultIguanaConnectionTimeOut: 3000,
  minEpochTimestamp: 1471620867,
  globalFeeLoaderTimeout: 1 // sec
};

// create a new object with non-writable values
var settings = {};
for (var key in _settings) {
  Object.defineProperty(settings, key, {
    value: _settings[key],
    writetable: false
  });
}