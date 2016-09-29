/*!
 * Iguana dev file
 * info: planned to store non-production vars
 */

  isDev = true; // set to true if you want to disable passphrase verification
  showSyncDebug = true;
  showConsoleMessages = false;

  // add your coind passphrases her one per each coin
  // on a login step they will be used as as source for walletpassphrase sequence
  coinPW = {
    'coind': {
      'btc': 'teach clutch code nominee ride garage fish neutral help upset correct decorate',
      'btcd': 'teach clutch code nominee ride garage fish neutral help upset correct decorate',
      'sys': 'razor strong battle turn walk enlist risk creek mixed over daughter excuse potato horror kingdom subject dad erode feel fresh output member polar rug',
      'doge': 'guide blossom jaguar final cushion lottery copy average guitar empower slam code before hockey park tilt differ flee century trick finish decide remember bone'
    },
    'iguana': 'lime lime'
  };

  // add an account per coin if you want to override 'own' account
  coinAccountsDev = {
    'coind': {
      'ltc': 'default',
      'btcd': 'pbca'
    }
  };