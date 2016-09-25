/*!
 * Iguana dev file
 * info: planned to store non-production vars
 */

  isDev = true; // set to true if you want to disable passphrase verification
  showSyncDebug = true;

  // add your coind passphrases her one per each coin
  // on a login step they will be used as as source for walletpassphrase sequence
  coinPW = {
    "coind": {
      "btc": "teach clutch code nominee ride garage fish neutral help upset correct decorate",
      "btcd": "teach clutch code nominee ride garage fish neutral help upset correct decorate",
      "ltc": "teach clutch code nominee ride garage fish neutral help upset correct decorate",
      "sys": "teach clutch code nominee ride garage fish neutral help upset correct decorate",
      "doge": "teach clutch code nominee ride garage fish neutral help upset correct decorate"
    },
    "iguana": "lime lime"
  };

  // add an account per coin if you want to override "own" account
  coinAccountsDev = {
    "coind": {
      "ltc": "default",
      "btcd": "pbca"
    }
  };