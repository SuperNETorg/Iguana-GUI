/*!
 * Iguana dev file
 * info: planned to store non-production vars
 */

  dev = new Array();
  dev.isDev = true; // set to true if you want to disable passphrase verification
  dev.showSyncDebug = true;
  dev.showConsoleMessages = true;

  // add your coind passphrases her one per each coin
  // on a login step they will be used as as source for walletpassphrase sequence
  dev.coinPW = {
    'coind': {
      'btc': 'teach clutch code nominee ride garage fish neutral help upset correct decorate',
      'btcd': 'teach clutch code nominee ride garage fish neutral help upset correct decorate',
      'sys': 'razor strong battle turn walk enlist risk creek mixed over daughter excuse potato horror kingdom subject dad erode feel fresh output member polar rug',
      'doge': 'guide blossom jaguar final cushion lottery copy average guitar empower slam code before hockey park tilt differ flee century trick finish decide remember bone'
    },
    'iguana': 'lime lime'
  };

  // add an account per coin if you want to override 'own' account
  dev.coinAccountsDev = {
    'coind': {
      'ltc': 'default',
      'btcd': 'pbca'
    }
  };