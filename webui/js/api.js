/*!
 * Iguana api config
 *
 */

// TODO: 1) add response handler
//       2) generalize get/post functions into one
//       3) add general error handler, e.g. coin is not added, wallet is locked etc
//       4) add localstorage hook on testPort success
//      (?) refactor conf into a singleton obj

// note(!): p2p may vary depending on a coin
// some coins put rpc at the p2p port+1 others port-1
// if no portp2p is specified iguana picks default port
// possible solution: check adjacent ports to verify which one is responding

var apiProto = function() {};

var activeCoin,
    portsTested = false,
    isIguana = false,
    isRT = false,
    coinsInfo = [], // cointains coin related info
    proxy = 'http://localhost:1337/'; // https://github.com/gr2m/CORS-Proxy

apiProto.prototype.getConf = function(discardCoinSpecificPort, coin) {
  var conf = {
      'server': {
        'protocol': 'http://',
        'ip': 'localhost',
        'iguanaPort': '7778'
      },
      'apiRoutes': {
        'bitcoinRPC' : {
          'walletPassphrase' : 'bitcoinrpc/walletpassphrase', // params: password String, timeout Int
          'encryptWallet' : 'bitcoinrpc/encryptwallet', // params: passphrase String
          'listTransactions': 'bitcoinrpc/listtransactions', // params: account String, count: default is 1
          'getTransaction': 'bitcoinrpc/gettransaction', // params: txid String
          'getBalance': 'bitcoinrpc/getbalance' // params: account String
        },
        'iguana': {
          'addCoin': 'iguana/addcoin', // params newcoin, portp2p, services
          'rates': 'iguana/rates', // params: coin/curency or currency/currency or coin/coin, variable length
          'rate': 'iguana/rate' // params: base, rel e.g. base=BTC&rel=USD, !param values in CAPS!
        }
      },
      'coins': {
        'btc': {
          'portp2p': 8332,
          'user': 'pbca26', // add your rpc pair here
          'pass': 'pbca26',
          'iguanaCurl': '{\"prefetchlag\":-1,\"poll\":1,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"newcoin\":\"BTC\",\"startpend\":64,\"endpend\":64,\"services\":129,\"maxpeers\":512,\"RELAY\":1,\"VALIDATE\":1,\"portp2p\":8333,\"minconfirms\":1}',
          'currentBlockHeightExtSource': 'https://blockexplorer.com/api/status?q=getBlockCount'
        },
        'btcd': {
          'portp2p': 14632,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"prefetchlag\":11,\"poll\":50,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"newcoin\":\"BTCD\",\"startpend\":512,\"endpend\":512,\"services\":129,\"maxpeers\":512,\"RELAY\":1,\"VALIDATE\":1,\"portp2p\":14631,\"rpc\":14632,\"minconfirms\":5}',
          'currentBlockHeightExtSource': 'http://explorebtcd.info/api/status?q=getBlockCount'
        },
        'ltc': {
          'portp2p': 9332,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"startpend\":68,\"endpend\":68,\"services\":129,\"maxpeers\":256,\"newcoin\":\"LTC\",\"name\":\"Litecoin\",\"hasheaders\":1,\"useaddmultisig\":0,\"netmagic\":\"fbc0b6db\",\"p2p\":9333,\"rpc\":9332,\"pubval\":48,\"p2shval\":5,\"wifval\":176,\"txfee_satoshis\":\"100000\",\"isPoS\":0,\"minoutput\":10000,\"minconfirms\":2,\"genesishash\":\"12a765e31ffd4059bada1e25190f6e98c99d9714d334efa41a195a7e7e04bfe2\",\"genesis\":{\"version\":1,\"timestamp\":1317972665,\"nBits\":\"1e0ffff0\",\"nonce\":2084524493,\"merkle_root\":\"97ddfbbae6be97fd6cdf3e7ca13232a3afff2353e29badfab7f73011edd4ced9\"},\"alertpubkey\":\"040184710fa689ad5023690c80f3a49c8f13f8d45b8c857fbcbc8bc4a8e4d3eb4b10f4d4604fa08dce601aaf0f470216fe1b51850b4acf21b179c45070ac7b03a9\",\"protover\":70002}',
          'currentBlockHeightExtSource': 'http://ltc.blockr.io/api/v1/coin/info'
          // alt. url: https://api.blockcypher.com/v1/ltc/main
          // beware if you abuse it you get temp ban
        },
        'sys': {
          'portp2p': 8370,
          'coindPort': 8368,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"startpend\":18,\"endpend\":18,\"services\":129,\"maxpeers\":256,\"newcoin\":\"SYS\",\"name\":\"SYScoin\",\"hasheaders\":0,\"useaddmultisig\":0,\"netmagic\":\"f9beb4d9\",\"p2p\":8369,\"rpc\":8370,\"pubval\":0,\"p2shval\":5,\"wifval\":128,\"txfee_satoshis\":\"100000\",\"isPoS\":0,\"minoutput\":10000,\"minconfirms\":2,\"genesishash\":\"0000072d66e51ab87de265765cc8bdd2d229a4307c672a1b3d5af692519cf765\",\"genesis\":{\"version\":1,\"timestamp\":1450473723,\"nBits\":\"1e0ffff0\",\"nonce\":5258726,\"merkle_root\":\"5215c5a2af9b63f2550b635eb2b354bb13645fd8fa31275394eb161944303065\"},\"protover\":70012,\"auxpow\":1,\"fixit\":0}',
          'currentBlockHeightExtSource': proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary' // universal resource for many coins
        },
        'uno': {
          'portp2p': 65535,
          'user': 'user', // add your rpc pair here`
          'pass': 'pass',
          'iguanaCurl': '{\"services\":129,\"auxpow\":1,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"UNO\",\"name\":\"Unobtanium\",\"netmagic\":\"03d5b503\",\"p2p\":65534,\"rpc\":65535,\"pubval\":130,\"p2shval\":30,\"wifval\":224,\"txfee_satoshis\":\"1000000\",\"minconfirms\":2,\"genesishash\":\"000004c2fc5fffb810dccc197d603690099a68305232e552d96ccbe8e2c52b75\",\"genesis\":{\"version\":1,\"timestamp\":1375548986,\"nBits\":\"1e0fffff\",\"nonce\":1211565,\"merkle_root\":\"36a192e90f70131a884fe541a1e8a5643a28ba4cb24cbb2924bd0ee483f7f484\"},\"alertpubkey\":\"04fd68acb6a895f3462d91b43eef0da845f0d531958a858554feab3ac330562bf76910700b3f7c29ee273ddc4da2bb5b953858f6958a50e8831eb43ee30c32f21d\"}',
          'currentBlockHeightExtSource': proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary' // universal resource for many coins
        },
        'nmc': {
          'portp2p': 8336,
          'user': 'user', // add your rpc pair here`
          'pass': 'pass',
          'iguanaCurl': 'disabled',
          'currentBlockHeightExtSource': proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary'
        },
        'gmc': {
          'portp2p': 40001,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"startpend\":8,\"endpend\":4,\"services\":129,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"GMC\",\"name\":\"GameCredits\",\"netmagic\":\"fbc0b6db\",\"p2p\":40002,\"rpc\":40001,\"pubval\":38,\"p2shval\":5,\"wifval\":166,\"txfee_satoshis\":\"100000\",\"minconfirms\":2,\"genesishash\":\"91ec5f25ee9a0ffa1af7d4da4db9a552228dd2dc77cdb15b738be4e1f55f30ee\",\"genesis\":{\"hashalgo\":\"scrypt\",\"version\":1,\"timestamp\":1392757140,\"nBits\":\"1e0ffff0\",\"nonce\":2084565393,\"merkle_root\":\"d849db99a14164f4b4c8ad6d2d8d7e2b1ba7f89963e9f4bf9fad5ff1a4754429\"},\"alertpubkey\":\"04fc9702847840aaf195de8442ebecedf5b095cdbb9bc716bda9110971b28a49e0ead8564ff0db22209e0374782c093bb899692d524e9d6a6956e7c5ecbcd68284\",\"auxpow\":1,\"protover\":80006,\"isPoS\":0,\"fixit\":0}',
          'currentBlockHeightExtSource': proxy + '159.203.226.245:3000/api/status?q=getInfo'
        },
        'mzc': {
          'portp2p': 12832,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"services\":129,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"MZC\",\"name\":\"MazaCoin\",\"netmagic\":\"f8b503df\",\"p2p\":12835,\"rpc\":12832,\"pubval\":50,\"p2shval\":9,\"wifval\":224,\"txfee_satoshis\":\"0\",\"minconfirms\":2,\"genesishash\":\"00000c7c73d8ce604178dae13f0fc6ec0be3275614366d44b1b4b5c6e238c60c\",\"genesis\":{\"version\":1,\"timestamp\":1390747675,\"nBits\":\"1e0ffff0\",\"nonce\":2091390249,\"merkle_root\":\"62d496378e5834989dd9594cfc168dbb76f84a39bbda18286cddc7d1d1589f4f\"},\"alertpubkey\":\"04f09702847840aaf195de8442ebecedf5b095cdbb9bc716bda9110971b28a49e0ead8564ff0db22209e0374782c093bb899692d524e9d6a6956e7c5ecbcd68284\"}',
          'currentBlockHeightExtSource': proxy + 'explorer.cryptoadhd.com:2750/chain/Mazacoin/q/getblockcount'
        },
        'frk': {
          'portp2p': 7913,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"FRK\",\"name\":\"Franko\",\"netmagic\":\"7defaced\",\"p2p\":7912,\"rpc\":7913,\"pubval\":35,\"p2shval\":5,\"wifval\":163,\"txfee_satoshis\":\"0\",\"minconfirms\":2,\"genesishash\":\"19225ae90d538561217b5949e98ca4964ac91af39090d1a4407c892293e4f44f\",\"genesis\":{\"hashalgo\":\"scrypt\",\"version\":1,\"timestamp\":1368144664,\"nBits\":\"1e0ffff0\",\"nonce\":731837,\"merkle_root\":\"b78f79f1d10029cc45ed3d5a1db7bd423d4ee170c03baf110a62565d16a21dca\"},\"alertpubkey\":\"04d4da7a5dae4db797d9b0644d57a5cd50e05a70f36091cd62e2fc41c98ded06340be5a43a35e185690cd9cde5d72da8f6d065b499b06f51dcfba14aad859f443a\"}',
          'currentBlockHeightExtSource': 'disabled' //'https://crossorigin.me/https://prohashing.com/explorerJson/getInfo?coin_name=Franko' // double req, too slow
        },
        'doge': {
          'portp2p': 22555,
          'user': 'user', // add your rpc pair here
          'pass': 'pass',
          'iguanaCurl': '{\"startpend\":8,\"endpend\":4,\"services\":129,\"auxpow\":1,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"DOGE\",\"name\":\"Dogecoin\",\"netmagic\":\"C0C0C0C0\",\"p2p\":22556,\"rpc\":22555,\"pubval\":30,\"p2shval\":5,\"wifval\":128,\"txfee_satoshis\":\"100000000\",\"minconfirms\":2,\"genesishash\":\"1a91e3dace36e2be3bf030a65679fe821aa1d6ef92e7c9902eb318182c355691\",\"genesis\":{\"hashalgo\": \"scrypt\",\"version\":1,\"timestamp\":1386325540,\"nBits\":\"1e0ffff0\",\"nonce\":99943,\"merkle_root\":\"5b2a3f53f605d62c53e62932dac6925e3d74afa5a4b459745c36d42d0ed26a69\"},\"alertpubkey\":\"04d4da7a5dae4db797d9b0644d57a5cd50e05a70f36091cd62e2fc41c98ded06340be5a43a35e185690cd9cde5d72da8f6d065b499b06f51dcfba14aad859f443a\"}',
          'currentBlockHeightExtSource': proxy + 'api.blockcypher.com/v1/doge/main'
        }
      }
  };

  // coin port switch hook
  if (coin && conf.coins[coin].coindPort && !isIguana) {
    conf.server.port = conf.coins[coin].coindPort;
    return conf;
  }

  if (activeCoin && !discardCoinSpecificPort) {
    conf.server.port = conf.coins[activeCoin].portp2p;
    if (!isIguana)
      if (conf.coins[activeCoin].coindPort) conf.server.port = conf.coins[activeCoin].coindPort;
  } else {
    conf.server.port = conf.server.iguanaPort;
  }

  if (coin) conf.server.port = conf.coins[coin].portp2p;

  return conf;
}

apiProto.prototype.errorHandler = function(response, index) {
  if (response.error === 'need to unlock wallet') {
    console.log('unexpected crash or else');
    helperProto.prototype.logout();
  }
  if (response.error === 'iguana jsonstr expired') {
    console.log('server is busy');

    return 10;
  }
  if (response.error === 'coin is busy processing') {
    if ($('#debug-sync-info') && index !== undefined)
      $('#debug-sync-info').append('coin ' + index + ' is busy processing<br/>');

    console.log('server is busy');

    return 10;
  }
  if (response.error === 'null return from iguana_bitcoinRPC') {
    console.log('iguana crashed?');

    return 10;
    //location.reload();
  }
}

apiProto.prototype.getServerUrl = function(discardCoinSpecificPort) {
  return apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(discardCoinSpecificPort).server.port + '/api/';
}

apiProto.prototype.getBasicAuthHeaderObj = function(conf, coin) {
  if (conf)
    return isIguana ? '' : { 'Authorization': 'Basic ' + btoa(conf.user + ':' + conf.pass) };
  else
    if (activeCoin || coin)
      return isIguana ? '' : { 'Authorization': 'Basic ' + btoa(apiProto.prototype.getConf().coins[coin ? coin : activeCoin].user + ':' + apiProto.prototype.getConf().coins[coin ? coin : activeCoin].pass) };
}

apiProto.prototype.getBitcoinRPCPayloadObj = function(method, params) {
  return '{ \"agent\": \"bitcoinrpc\", \"method\": \"' + method + '\", ' + (!isIguana ? '\"timeout\": \"30000\"' : '\"immediate\": \"100\"') + ', \"params\": [' + (!params ? '' : params) + '] }';
}

apiProto.prototype.getFullApiRoute = function(method, conf, coin) {
  if (conf)
    return isIguana ? apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + conf.portp2p + '/api/bitcoinrpc/' + method : proxy + apiProto.prototype.getConf().server.ip + ':' + (conf.coindPort ? conf.coindPort : conf.portp2p);
  else
    return isIguana ? apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(false, coin).server.port + '/api/bitcoinrpc/' + method : proxy + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(false, coin).server.port;
}

// test must be hooked to initial gui start or addcoin method
// test 1 port for a single coin
apiProto.prototype.testCoinPorts = function() {
  var result = false,
      _index = 0;
  $('#debug-sync-info').html('');

  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    var fullUrl = apiProto.prototype.getFullApiRoute('getinfo', conf);
    var postData = apiProto.prototype.getBitcoinRPCPayloadObj('getinfo');
    var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(conf);

    if (!coinsInfo[index]) coinsInfo[index] = [];
    coinsInfo[index].connection = false;

    $.ajax({
      url: fullUrl,
      cache: false,
      async: false,
      dataType: 'json',
      type: 'POST',
      data: postData,
      headers: postAuthHeaders,
      //timeout: '3000',
      success: function(response) {
        apiProto.prototype.errorHandler(response, index);
        console.log(response);

        if (response.error === 'coin is busy processing') {
          coinsInfo[index].connection = true;
          coinsInfo[index].RT = false;
        }

        if (response.result.walletversion || response.result === 'success') {
          console.log('portp2p con test passed');
          console.log(index + ' daemon is detected');
          //activeCoin = index;
          coinsInfo[index].connection = true;

          // non-iguana
          if (!isIguana) {
            var networkCurrentHeight = 0; //apiProto.prototype.getCoinCurrentHeight(index); temp disabled
            var coindCheckRTResponse = apiProto.prototype.coindCheckRT(index);
            var syncPercentage = (response.result.blocks * 100 / networkCurrentHeight).toFixed(2);
            console.log('Connections: ' + response.result.connections);
            console.log('Blocks: ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== "Infinity" ? syncPercentage : 'N/A ') + '% synced)');

            if (response.result.blocks === networkCurrentHeight || coindCheckRTResponse) {
              isRT = true;
              coinsInfo[index].RT = true;
            } else {
              isRT = false;
              coinsInfo[index].RT = false;
              console.log('RT is not ready yet!');
            }

            if (isDev && showSyncDebug)
              if ($('#debug-sync-info').html().indexOf('coin: ' + index) < 0)
                $('#debug-sync-info').append('coin: ' + index + ', con ' + response.result.connections + ', blocks ' + response.result.blocks + '/' + networkCurrentHeight + ' (' + (syncPercentage !== "Infinity" ? syncPercentage : 'N/A ') + '% synced), RT: ' + (isRT ? 'yes' : 'no') + '<br/>');

            // temp code
            if (isRT)
              $('#temp-out-of-sync').addClass('hidden');
            else
              $('#temp-out-of-sync').removeClass('hidden');
          }
        }
        if (response.status && isIguana) {
          var iguanaGetInfo = response.status.split(' ');
          var totalBundles = iguanaGetInfo[20].split(':');
          var currentHeight = iguanaGetInfo[9].replace('h.', '');
          var peers = iguanaGetInfo[16].split('/');

          coinsInfo[index].connection = true;

          // iguana
          if (response.status.indexOf('.RT0 ') > -1) {
            isRT = false;
            coinsInfo[index].RT = false;
            console.log('RT is not ready yet!');
          } else {
            isRT = true;
            coinsInfo[index].RT = true;
          }

          // disable coin in iguna mode
          if (conf.iguanaCurl === 'disabled') coinsInfo[index].iguana = false;

          console.log('Connections: ' + peers[0].replace('peers.', ''));
          console.log('Blocks: ' + currentHeight);
          console.log('Bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' + totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced)');

          if (isDev && showSyncDebug)
            if ($('#debug-sync-info').html().indexOf('coin: ' + index) < 0)
              $('#debug-sync-info').append('coin: ' + index + ', con ' + peers[0].replace('peers.', '') + ', bundles: ' + iguanaGetInfo[14].replace('E.', '') + '/' + totalBundles[0] + ' (' + (iguanaGetInfo[14].replace('E.', '') * 100 / totalBundles[0]).toFixed(2) + '% synced), RT: ' + (isRT ? 'yes' : 'no') + '<br/>');

          // temp code
          if (isRT)
            $('#temp-out-of-sync').addClass('hidden');
          else
            $('#temp-out-of-sync').removeClass('hidden');
        }
      },
      error: function(response) {
        apiProto.prototype.errorHandler(response);

        if (response.statusText === 'error' && !isIguana) console.log('is proxy server running?');
        else if (!response.statusCode) console.log('server is busy, check back later');
        if (response.responseText && response.responseText.indexOf('Verifying blocks...') > -1) console.log(index + ' is verifying blocks...');

        if (response.responseText) console.log('coind response: ' + response.responseText);

        /*if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) console.log('no coin is detected, at least one daemon must be running!');
        _index++;*/
      }
    }).done(function() {
      /*if (Object.keys(apiProto.prototype.getConf().coins).length - 1 === _index) console.log('no coin is detected, at least one daemon must be running!');
      _index++;*/
    });
  });

  return result;
}

// check if iguana is running
apiProto.prototype.testConnection = function() {
  var result = false;

  // test if iguana is running
  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort;
  $.ajax({
    url: defaultIguanaServerUrl + '/api/iguana/getconnectioncount',
    cache: false,
    dataType: 'text',
    async: false,
    type: 'GET',
    timeout: '1000',
    success: function (response) {
      apiProto.prototype.errorHandler(response);
      // iguana env
      console.log('iguana is detected');
      isIguana = true;
      apiProto.prototype.testCoinPorts();
    },
    error: function (response) {
      apiProto.prototype.errorHandler(response);
      // non-iguana env
      console.log('running non-iguana env');
      apiProto.prototype.testCoinPorts();
    }
  });

  portsTested = true;
}

apiProto.prototype.walletLogin = function(passphrase, timeout, coin) {
  var result = false;

  var fullUrl = apiProto.prototype.getFullApiRoute('walletpassphrase', null, coin);
  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf().server.iguanaPort + '/api/bitcoinrpc/walletpassphrase';
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletpassphrase', '\"' + passphrase + '\", ' + timeout);
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: isIguana ? defaultIguanaServerUrl : fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    success: function(response) {
      console.log(response);
      result = true;
    },
    error: function(response) {
      if (response.responseText) {
        if (response.responseText.indexOf('Error: Wallet is already unlocked, use walletlock first if need to change unlock settings.') > -1)
          result = true;
        if (response.responseText.indexOf('Error: The wallet passphrase entered was incorrect') > -1) result = -14;
        if (response.responseText.indexOf('Error: running with an unencrypted wallet, but walletpassphrase was called') > -1) result = -15;
        console.log(response.responseText);
      } else {
        console.log(response.error);
      }
    }
  });

  return result;
}

apiProto.prototype.walletCreate = function(passphrase) {
  var result = false;

  var fullUrl = apiProto.prototype.getFullApiRoute('encryptwallet', null, coin);
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('encryptwallet', '\"' + passphrase + '\"');
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders
  })
  .done(function(_response) {
    console.log(_response);
    apiProto.prototype.errorHandler(_response);

    if (_response.result) {
      // non-iguana
      if (_response.result) {
        result = _response.result;
      } else {
        result = false;
      }
    } else {
      // iguana
      var response = $.parseJSON(_response);

      if (response.error) {
        // do something
        console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.result === 'success') {
          result = response;
        } else {
          result = false;
        }
      }
    }
  });

  return result;
}

apiProto.prototype.listTransactions = function(account, coin) {
  var result = false;

  if (coinAccountsDev && !isIguana)
    if (coinAccountsDev.coind[coin])
      account = coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('listtransactions', null, coin);
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('listtransactions', '\"' + account + '\", 19'); // last 20 tx
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response);
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response) !== 10) {
      console.log(_response);
      if (_response.result) {
        // non-iguana
        if (_response.result.length) {
          result = _response.result;
        } else {
          result = false;
        }
      } else {
        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          console.log('error: ' + response.error);
          result = false;
        } else {
          if (response.result.length) {
            result = response.result;
          } else {
            result = false;
          }
        }
      }
    }
  });

  return result;
}

apiProto.prototype.getTransaction = function(txid) {
  var result = false;

  var fullUrl = apiProto.prototype.getFullApiRoute('gettransaction');
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('gettransaction', '\"' + txid + '\"');
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj();

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      apiProto.prototype.errorHandler(response);
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response);

    if (_response.result) {
      // non-iguana
      if (_response.result) {
        result = _response.result;
      } else {
        result = false;
      }
    } else {
      // iguana
      var response = _response;

      if (response.error) {
        // do something
        console.log('error: ' + response.error);
        result = false;
      } else {
        if (response.txid) {
          result = response;
        } else {
          result = false;
        }
      }
    }
  });

  return result;
}

apiProto.prototype.getBalance = function(account, coin) {
  var result = false;

  if (coinAccountsDev && !isIguana)
    if (coinAccountsDev.coind[coin])
      account = coinAccountsDev.coind[coin];

  var fullUrl = apiProto.prototype.getFullApiRoute('getbalance', null, coin);
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('getbalance', coin === 'btcd' && !isIguana ? null : '\"' + account + '\"'); // avoid using account names in bitcoindarkd
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    /*success: function(response) {
      console.log(response);
    },*/
    error: function(response) {
      if (response.responseText)
        if (response.responseText.indexOf('Accounting API is deprecated') > -1 || response.responseText.indexOf('If you want to use accounting API')) console.log('add enableaccounts=1 and staking=0 in btcd conf file');
    }
  })
  .done(function(_response) {
    if (apiProto.prototype.errorHandler(_response) !== 10) {
      if (_response.result > -1 || Number(_response) === 0) {
        // non-iguana
        result = _response.result || _response;
      } else {
        console.log(_response);

        // iguana
        var response = $.parseJSON(_response);

        if (response.error) {
          // do something
          console.log('error: ' + response.error);
          result = false;
        } else {
          if (response) {
            result = response;
          } else {
            result = false;
          }
        }
      }
    }
  });

  return result;
}

apiProto.prototype.walletLock = function(coin) {
  var result = false;

  var fullUrl = apiProto.prototype.getFullApiRoute('walletlock', null, coin);
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('walletlock');
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response);

    if (_response.result) {
      // non-iguana
      result = _response.result;
    } else {
      console.log(_response);

      // iguana
      var response = typeof _response === 'object' ? _response : $.parseJSON(_response);

      if (response.error) {
        // do something
        console.log('error: ' + response.error);
        result = false;
      } else {
        if (response) {
          result = response;
        } else {
          result = false;
        }
      }
    }
  });

  return result;
}

apiProto.prototype.coindCheckRT = function(coin) {
  var result = false;

  var fullUrl = apiProto.prototype.getFullApiRoute('getblocktemplate', null, coin);
  var postData = apiProto.prototype.getBitcoinRPCPayloadObj('getblocktemplate');
  var postAuthHeaders = apiProto.prototype.getBasicAuthHeaderObj(null, coin);

  $.ajax({
    url: fullUrl,
    cache: false,
    async: false,
    dataType: 'json',
    type: 'POST',
    data: postData,
    headers: postAuthHeaders,
    error: function(response) {
      if (response.responseText.indexOf(':-10') === -1) result = true;
      else result = false;
    }
  })
  .done(function(_response) {
    apiProto.prototype.errorHandler(_response);
    if (_response.result.bits) result = true;
    else result = false;
  });

  return result;
}

apiProto.prototype.addCoin = function(coin) {
  var result = false;

  $.ajax({
    url: apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ':' + apiProto.prototype.getConf(true).server.port,
    cache: false,
    dataType: 'json',
    type: 'POST',
    data: apiProto.prototype.getConf().coins[coin].iguanaCurl,
    async: false
  })
  .done(function(response) {
    console.log(response)
    if (response.error) {
      // do something
      console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'coin added' || response.result === 'coin already there') {
        result = response;
      } else {
        result = false;
      }
    }
  });

  return result;
}

/* external block explorer website */
apiProto.prototype.getCoinCurrentHeight = function(coin) {
  var result = false;

  if (apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource !== 'disabled')
    $.ajax({
      url: apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource,
      cache: false,
      dataType: 'text',
      async: false
    })
    .done(function(_response) {
      var response = $.parseJSON(_response);
      console.log('height');
      console.log(response);

      if (response.blockcount || response.info || response.height || response.data || response[coin] || response.blocks) {
        if (response.blockcount) result = response.blockcount;
        if (response.info) result = response.info.blocks;
        if (response.height) result = response.height;
        if (response.blocks) result = response.blocks;
        if (response.data) result = response.data.last_block.nb;
        if (response[coin]) result = response[coin].height;
      } else {
        console.log('error retrieving current block height from ' + apiProto.prototype.getConf().coins[coin].currentBlockHeightExtSource);
        result = false;
      }
    });
  else
    result = 'NA';

  return result;
}

/* !requires the latest iguana build! */
apiProto.prototype.getIguanaRate = function(quote) {
  var result = false;
  var quoteComponents = quote.split('/');

  $.ajax({
    url: apiProto.prototype.getServerUrl(true) + apiProto.prototype.getConf().apiRoutes.iguana.rate + '?base=' + quoteComponents[0] + '&rel=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false
  })
  .done(function(_response) {
    var response = $.parseJSON(_response);

    if (response.error) {
      // do something
      console.log('error: ' + response.error);
      result = false;
    } else {
      if (response.result === 'success') {
        result = response.quote;
      } else {
        result = false;
      }
    }
  });

  return result;
}

// get a quote form an external source
// cryptonator is officially closed it's gates, no more cors
// keep an eye on, may be they'll change their mind
apiProto.prototype.getExternalRate = function(quote) {
  var result = false,
      firstSourceFailed = false,
      quoteComponents = quote.split('/');

  quote = quote.toLowerCase().replace('/', '-');
  $.ajax({
    url: 'https://min-api.cryptocompare.com/data/price?fsym=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1],
    cache: false,
    dataType: 'text',
    async: false,
    success: function(_response) {
      var response = $.parseJSON(_response);

      if (response && response[quoteComponents[1]]) {
        result = response[quoteComponents[1]];
        console.log('rates source https://min-api.cryptocompare.com/data/price?fsym=' + quoteComponents[0] + '&tsyms=' + quoteComponents[1]);
      } else {
        result = false;
      }
    },
    error: function(response) {
      console.log('falling back to ext service #2');
      firstSourceFailed = true;
    }
  });

  if (firstSourceFailed)
    $.ajax({
      // cryptocoincharts doesn't have direct conversion altcoin -> currency
      // needs 2 requests at a time, one to get btc -> currency rate, another to get btc -> altcoin rate
      url: 'http://api.cryptocoincharts.info/tradingPair/btc_' + quoteComponents[1].toLowerCase(),
      cache: false,
      dataType: 'text',
      async: false,
      success: function(_response) {
        var response = $.parseJSON(_response);

        if (response.price) {
          btcToCurrency = response.price;

          // get btc -> altcoin rate
          $.ajax({
            url: 'https://poloniex.com/public?command=returnTicker',
            cache: false,
            dataType: 'text',
            async: false,
            success: function(_response) {
              var response = $.parseJSON(_response);

              if (response['BTC_' + quoteComponents[0].toUpperCase()]) {
                result = btcToCurrency * response['BTC_' + quoteComponents[0].toUpperCase()].last;
                console.log('rates source http://api.cryptocoincharts.info and https://poloniex.com');
              } else {
                result = false;
              }
            },
            error: function(response) {
              console.log('both services are failed to respond');
            }
          });
        } else {
          result = false;
        }
      },
      error: function(response) {
        console.log('both services failed to respond');
      }
    });

  return result;
}

apiProto.prototype.testConnection(); // run this everytime a page is (re)loaded