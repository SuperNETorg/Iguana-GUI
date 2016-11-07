/*!
 * Iguana dev file
 * info: debug purposes
 */

  dev = new Array();
  dev.isDev = true; // set to true if you want to disable passphrase verification in iguana env
  dev.showSyncDebug = false;
  dev.showConsoleMessages = true;

  // add your coind passphrases her one per each coin
  // on a login step they will be used as as source for walletpassphrase sequence
  dev.coinPW = {
    'coind': {
      'btc': 'teach clutch code nominee ride garage fish neutral help upset correct decorate',
      'btcd': 'teach clutch code nominee ride garage fish neutral help upset correct decorate',
      'sys': 'razor strong battle turn walk enlist risk creek mixed over daughter excuse potato horror kingdom subject dad erode feel fresh output member polar rug',
      'doge': 'guide blossom jaguar final cushion lottery copy average guitar empower slam code before hockey park tilt differ flee century trick finish decide remember bone',
      'ltc': 'area march pause step law shrug curve dinosaur gown deny inspire matter chest maximum often usual lion purse wave squirrel easy favorite mutual width',
      'nmc': 'table fall scissors hammer champion inmate exhibit below fault post lock spatial early frown reveal balcony toward dirt ginger enable mobile scrub budget embrace',
      'kmd': 'radar hint palm taste guess sweet exhaust start concert aspect burger first'
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

  // for simultaneous dev in iguana and non-iguana modes
  dev.sessions = {
    'Chrome': false, // true - iguana, false - coind
    'Firefox': false
  };

// dev
var sendDataTest = { 'btcd' : { address: 'R9XTAMpr2Sm4xxUQA1g1brxPZGaTvj9xqp', val: '0.00001', note: 'gui test send to kashi\'s addr' },
                     'sys': { address: '127a42hPqaUy6zBbgfo5HHh7G9WGBQYQR4', val: '0.00001', note: 'gui test send to ed888 addr' } };

function loadTestSendData(coin) {
  if (sendDataTest[coin]) {
    $('.tx-address').val(sendDataTest[coin].address);
    $('.tx-amount').val(sendDataTest[coin].val);
    $('.tx-note').val(sendDataTest[coin].note);
  }
}