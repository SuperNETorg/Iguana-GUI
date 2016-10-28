/*!
 * Iguana dev file
 * info: debug purposes
 */

  dev = new Array();
  dev.isDev = false; // set to true if you want to disable passphrase verification in iguana env
  dev.showSyncDebug = false;
  dev.showConsoleMessages = false;

  // add your coind passphrases her one per each coin
  // on a login step they will be used as as source for walletpassphrase sequence
  dev.coinPW = {
    'coind': {
      'btc': '',
    },
    'iguana': ''
  };

  // add an account per coin if you want to override 'own' account
  dev.coinAccountsDev = {
    'coind': {
      'btcd': ''
    }
  };
  // dev.sessions = {
  //   'Chrome': false, // true - iguana, false - coind
  //   'Firefox': false
  // };