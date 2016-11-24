/*!
 * Iguana gui supported coins list
 * note: you can add your favourite coin to this list
 *       it is expected to work normally as any coin in the list below
 */

'use strict';

var supportedCoinsList = {
  'btc': {
    'name': 'Bitcoin',
    'portp2p': 8332,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': 'https://blockexplorer.com/api/status?q=getBlockCount'
  },
  'btcd': {
    'name': 'BitcoinDark',
    'portp2p': 14632,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': 'http://explorebtcd.info/api/status?q=getBlockCount'
  },
  'ltc': {
    'name': 'Litecoin',
    'portp2p': 9332,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': 'http://ltc.blockr.io/api/v1/coin/info'
    // alt. url: https://api.blockcypher.com/v1/ltc/main
    // beware if you abuse it you get temp ban
  },
  'sys': {
    'name': 'Syscoin',
    'portp2p': 8370,
    'coindPort': 8368,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': settings.proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary' // universal resource for many coins
  },
  'uno': {
    'name': 'Unobtanium',
    'portp2p': 65535,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': settings.proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary' // universal resource for many coins
  },
  'nmc': {
    'name': 'Namecoin',
    'portp2p': 8336,
    'user': 'user', // add your rpc pair here`
    'pass': 'pass',
    'currentBlockHeightExtSource': settings.proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary'
  },
  'gmc': {
    'name': 'GameCredits',
    'portp2p': 40001,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': settings.proxy + '159.203.226.245:3000/api/status?q=getInfo'
  },
  'mzc': {
    'name': 'MazaCoin',
    'portp2p': 12832,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': settings.proxy + 'explorer.cryptoadhd.com:2750/chain/Mazacoin/q/getblockcount'
  },
  'frk': {
    'name': 'Franko',
    'portp2p': 7913,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': 'disabled' //'https://crossorigin.me/https://prohashing.com/explorerJson/getInfo?coin_name=Franko' // double req, too slow
  },
  'doge': {
    'name': 'Dogecoin',
    'portp2p': 22555,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': settings.proxy + 'api.blockcypher.com/v1/doge/main'
  },
  'dgb': {
    'name': 'Digibyte',
    'portp2p': 14022,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'zet': { // coind is untested
    'name': 'Zetacoin',
    'portp2p': 17335,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'btm': { // coind is untested
    'name': 'Bitmark',
    'portp2p': 9266,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'carb': { // coind is untested
    'name': 'Carboncoin',
    'portp2p': 9351,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'anc': { // coind is untested
    'name': 'Anoncoin',
    'portp2p': 28332,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'kmd': {
    'name': 'Komodo',
    'portp2p': 7771,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'sc': {
    'name': 'Siacoin',
    'portp2p': 9980, // https://github.com/NebulousLabs/Sia/blob/master/siad/daemon_test.go
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'dem': {
    'name': 'Deutsche eMark',
    'portp2p': 6666,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'mec': {
    'name': 'Megacoin',
    'portp2p': 7951,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'frc': {
    'name': 'Freicoin',
    'portp2p': 8639, // https://github.com/freicoin/freicoin/blob/master/doc/Tor.txt
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'ppc': {
    'name': 'Peercoin',
    'portp2p': 9902,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'lmc': {
    'name': 'Lomocoin',
    'portp2p': 6802,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'emc2': {
    'name': 'Einsteinium',
    'portp2p': 41879,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'apc': {
    'name': 'Applecoin',
    'portp2p': 9556,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'nlg': {
    'name': 'Gulden',
    'portp2p': 9232,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  },
  'blk': {
    'name': 'Blackcoin',
    'portp2p': 15715,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'currentBlockHeightExtSource': ''
  }
};