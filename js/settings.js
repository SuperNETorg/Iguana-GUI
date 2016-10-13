var settings = {
  iguanaPort: '7778',
  proxy: 'http://localhost:1337/', // https://github.com/gr2m/CORS-Proxy
  ratesUpdateTimeout: 15, // sec, see dashboard/rates.js
  ratesUpdateMultiply: 0, // sec
  decimalPlacesCoin: 1,
  decimalPlacesCurrency: 2,
  decimalPlacesTxUnit: 5,
  dashboardUpdateTimout: 15, // sec
  defaultCurrency: 'USD',
  portPollUpdateTimeout: 60, // sec
  defaultSessionLifetime: 7200, // sec
  defaultWalletUnlockPeriod: 3, // sec
  defaultTransactionsCount: 20,
  defaultAccountNameIguana: 'default', // note: change to a specific account name if needed; default coind account name is empty string
  defaultAccountNameCoind: ''
};