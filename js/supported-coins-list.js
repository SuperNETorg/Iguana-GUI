var supportedCoinsList = {
  'btc': {
    'name': 'Bitcoin',
    'portp2p': 8332,
    'user': 'pbca26', // add your rpc pair here
    'pass': 'pbca26',
    'iguanaCurl': '{\"prefetchlag\":-1,\"poll\":1,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"newcoin\":\"BTC\",\"startpend\":64,\"endpend\":64,\"services\":129,\"maxpeers\":512,\"RELAY\":1,\"VALIDATE\":1,\"portp2p\":8333,\"minconfirms\":1}',
    'currentBlockHeightExtSource': 'https://blockexplorer.com/api/status?q=getBlockCount'
  },
  'btcd': {
    'name': 'BitcoinDark',
    'portp2p': 14632,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"prefetchlag\":11,\"poll\":50,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"newcoin\":\"BTCD\",\"startpend\":512,\"endpend\":512,\"services\":129,\"maxpeers\":512,\"RELAY\":1,\"VALIDATE\":1,\"portp2p\":14631,\"rpc\":14632,\"minconfirms\":5}',
    'currentBlockHeightExtSource': 'http://explorebtcd.info/api/status?q=getBlockCount'
  },
  'ltc': {
    'name': 'Dogecoin',
    'portp2p': 9332,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"startpend\":68,\"endpend\":68,\"services\":129,\"maxpeers\":256,\"newcoin\":\"LTC\",\"name\":\"Litecoin\",\"hasheaders\":1,\"useaddmultisig\":0,\"netmagic\":\"fbc0b6db\",\"p2p\":9333,\"rpc\":9332,\"pubval\":48,\"p2shval\":5,\"wifval\":176,\"txfee_satoshis\":\"100000\",\"isPoS\":0,\"minoutput\":10000,\"minconfirms\":2,\"genesishash\":\"12a765e31ffd4059bada1e25190f6e98c99d9714d334efa41a195a7e7e04bfe2\",\"genesis\":{\"version\":1,\"timestamp\":1317972665,\"nBits\":\"1e0ffff0\",\"nonce\":2084524493,\"merkle_root\":\"97ddfbbae6be97fd6cdf3e7ca13232a3afff2353e29badfab7f73011edd4ced9\"},\"alertpubkey\":\"040184710fa689ad5023690c80f3a49c8f13f8d45b8c857fbcbc8bc4a8e4d3eb4b10f4d4604fa08dce601aaf0f470216fe1b51850b4acf21b179c45070ac7b03a9\",\"protover\":70002}',
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
    'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"startpend\":18,\"endpend\":18,\"services\":129,\"maxpeers\":256,\"newcoin\":\"SYS\",\"name\":\"SYScoin\",\"hasheaders\":0,\"useaddmultisig\":0,\"netmagic\":\"f9beb4d9\",\"p2p\":8369,\"rpc\":8370,\"pubval\":0,\"p2shval\":5,\"wifval\":128,\"txfee_satoshis\":\"100000\",\"isPoS\":0,\"minoutput\":10000,\"minconfirms\":2,\"genesishash\":\"0000072d66e51ab87de265765cc8bdd2d229a4307c672a1b3d5af692519cf765\",\"genesis\":{\"version\":1,\"timestamp\":1450473723,\"nBits\":\"1e0ffff0\",\"nonce\":5258726,\"merkle_root\":\"5215c5a2af9b63f2550b635eb2b354bb13645fd8fa31275394eb161944303065\"},\"protover\":70012,\"auxpow\":1,\"fixit\":0}',
    'currentBlockHeightExtSource': settings.proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary' // universal resource for many coins
  },
  'uno': {
    'name': 'Unobtanium',
    'portp2p': 65535,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"services\":129,\"auxpow\":1,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"UNO\",\"name\":\"Unobtanium\",\"netmagic\":\"03d5b503\",\"p2p\":65534,\"rpc\":65535,\"pubval\":130,\"p2shval\":30,\"wifval\":224,\"txfee_satoshis\":\"1000000\",\"minconfirms\":2,\"genesishash\":\"000004c2fc5fffb810dccc197d603690099a68305232e552d96ccbe8e2c52b75\",\"genesis\":{\"version\":1,\"timestamp\":1375548986,\"nBits\":\"1e0fffff\",\"nonce\":1211565,\"merkle_root\":\"36a192e90f70131a884fe541a1e8a5643a28ba4cb24cbb2924bd0ee483f7f484\"},\"alertpubkey\":\"04fd68acb6a895f3462d91b43eef0da845f0d531958a858554feab3ac330562bf76910700b3f7c29ee273ddc4da2bb5b953858f6958a50e8831eb43ee30c32f21d\"}',
    'currentBlockHeightExtSource': settings.proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary' // universal resource for many coins
  },
  'nmc': {
    'name': 'Namecoin',
    'portp2p': 8336,
    'user': 'user', // add your rpc pair here`
    'pass': 'pass',
    'iguanaCurl': 'disabled' , // currently disabled in iguana env
    'currentBlockHeightExtSource': settings.proxy + 'chainz.cryptoid.info/explorer/api.dws?q=summary'
  },
  'gmc': {
    'name': 'GameCredits',
    'portp2p': 40001,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"startpend\":8,\"endpend\":4,\"services\":129,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"GMC\",\"name\":\"GameCredits\",\"netmagic\":\"fbc0b6db\",\"p2p\":40002,\"rpc\":40001,\"pubval\":38,\"p2shval\":5,\"wifval\":166,\"txfee_satoshis\":\"100000\",\"minconfirms\":2,\"genesishash\":\"91ec5f25ee9a0ffa1af7d4da4db9a552228dd2dc77cdb15b738be4e1f55f30ee\",\"genesis\":{\"hashalgo\":\"scrypt\",\"version\":1,\"timestamp\":1392757140,\"nBits\":\"1e0ffff0\",\"nonce\":2084565393,\"merkle_root\":\"d849db99a14164f4b4c8ad6d2d8d7e2b1ba7f89963e9f4bf9fad5ff1a4754429\"},\"alertpubkey\":\"04fc9702847840aaf195de8442ebecedf5b095cdbb9bc716bda9110971b28a49e0ead8564ff0db22209e0374782c093bb899692d524e9d6a6956e7c5ecbcd68284\",\"auxpow\":1,\"protover\":80006,\"isPoS\":0,\"fixit\":0}',
    'currentBlockHeightExtSource': settings.proxy + '159.203.226.245:3000/api/status?q=getInfo'
  },
  'mzc': {
    'name': 'MazaCoin',
    'portp2p': 12832,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"services\":129,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"MZC\",\"name\":\"MazaCoin\",\"netmagic\":\"f8b503df\",\"p2p\":12835,\"rpc\":12832,\"pubval\":50,\"p2shval\":9,\"wifval\":224,\"txfee_satoshis\":\"0\",\"minconfirms\":2,\"genesishash\":\"00000c7c73d8ce604178dae13f0fc6ec0be3275614366d44b1b4b5c6e238c60c\",\"genesis\":{\"version\":1,\"timestamp\":1390747675,\"nBits\":\"1e0ffff0\",\"nonce\":2091390249,\"merkle_root\":\"62d496378e5834989dd9594cfc168dbb76f84a39bbda18286cddc7d1d1589f4f\"},\"alertpubkey\":\"04f09702847840aaf195de8442ebecedf5b095cdbb9bc716bda9110971b28a49e0ead8564ff0db22209e0374782c093bb899692d524e9d6a6956e7c5ecbcd68284\"}',
    'currentBlockHeightExtSource': settings.proxy + 'explorer.cryptoadhd.com:2750/chain/Mazacoin/q/getblockcount'
  },
  'frk': {
    'name': 'Franko',
    'portp2p': 7913,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"FRK\",\"name\":\"Franko\",\"netmagic\":\"7defaced\",\"p2p\":7912,\"rpc\":7913,\"pubval\":35,\"p2shval\":5,\"wifval\":163,\"txfee_satoshis\":\"0\",\"minconfirms\":2,\"genesishash\":\"19225ae90d538561217b5949e98ca4964ac91af39090d1a4407c892293e4f44f\",\"genesis\":{\"hashalgo\":\"scrypt\",\"version\":1,\"timestamp\":1368144664,\"nBits\":\"1e0ffff0\",\"nonce\":731837,\"merkle_root\":\"b78f79f1d10029cc45ed3d5a1db7bd423d4ee170c03baf110a62565d16a21dca\"},\"alertpubkey\":\"04d4da7a5dae4db797d9b0644d57a5cd50e05a70f36091cd62e2fc41c98ded06340be5a43a35e185690cd9cde5d72da8f6d065b499b06f51dcfba14aad859f443a\"}',
    'currentBlockHeightExtSource': 'disabled' //'https://crossorigin.me/https://prohashing.com/explorerJson/getInfo?coin_name=Franko' // double req, too slow
  },
  'doge': {
    'name': 'Dogecoin',
    'portp2p': 22555,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"startpend\":8,\"endpend\":4,\"services\":129,\"auxpow\":1,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"DOGE\",\"name\":\"Dogecoin\",\"netmagic\":\"C0C0C0C0\",\"p2p\":22556,\"rpc\":22555,\"pubval\":30,\"p2shval\":5,\"wifval\":128,\"txfee_satoshis\":\"100000000\",\"minconfirms\":2,\"genesishash\":\"1a91e3dace36e2be3bf030a65679fe821aa1d6ef92e7c9902eb318182c355691\",\"genesis\":{\"hashalgo\": \"scrypt\",\"version\":1,\"timestamp\":1386325540,\"nBits\":\"1e0ffff0\",\"nonce\":99943,\"merkle_root\":\"5b2a3f53f605d62c53e62932dac6925e3d74afa5a4b459745c36d42d0ed26a69\"},\"alertpubkey\":\"04d4da7a5dae4db797d9b0644d57a5cd50e05a70f36091cd62e2fc41c98ded06340be5a43a35e185690cd9cde5d72da8f6d065b499b06f51dcfba14aad859f443a\"}',
    'currentBlockHeightExtSource': settings.proxy + 'api.blockcypher.com/v1/doge/main'
  },
  'dgb': {
    'name': 'Digibyte',
    'portp2p': 14022,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"startpend\":16,\"endpend\":8,\"services\":129,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"DGB\",\"name\":\"Digibyte\",\"netmagic\":\"FAC3B6DA\",\"p2p\":12024,\"rpc\":14022,\"pubval\":30,\"p2shval\":5,\"wifval\":128,\"txfee_satoshis\":\"10000\",\"minconfirms\":2,\"genesishash\":\"7497ea1b465eb39f1c8f507bc877078fe016d6fcb6dfad3a64c98dcc6e1e8496\",\"genesis\":{\"version\":1,\"timestamp\":1389388394,\"nBits\":\"1e0ffff0\",\"nonce\":2447652,\"merkle_root\":\"72ddd9496b004221ed0557358846d9248ecd4c440ebd28ed901efc18757d0fad\"},\"alertpubkey\":\"04F04441C4757F356290A37C313C3772C5BC5003E898EB2E0CF365795543A7BF690C8BBBFA32EE3A3325477CE2000B7D0453EFBB203329D0F9DF34D5927D022BC9\"}',
    'currentBlockHeightExtSource': ''
  },
  'zet': { // coind is untested
    'name': 'Zetacoin',
    'portp2p': 17335,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"services\":129,\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"ZET\",\"name\":\"Zetacoin\",\"netmagic\":\"fab503df\",\"p2p\":17333,\"rpc\":17335,\"pubval\":80,\"p2shval\":9,\"wifval\":224,\"txfee_satoshis\":\"10000\",\"minconfirms\":2,\"genesishash\":\"000006cab7aa2be2da91015902aa4458dd5fbb8778d175c36d429dc986f2bff4\",\"genesis\":{\"version\":1,\"timestamp\":1375548986,\"nBits\":\"1e0fffff\",\"nonce\":2089928209,\"merkle_root\":\"d0227b8c3e3d07bce9656b3d9e474f050d23458aaead93357dcfdac9ab9b79f9\"},\"alertpubkey\":\"045337216002ca6a71d63edf062895417610a723d453e722bf4728996c58661cdac3d4dec5cecd449b9086e9602b35cc726a9e0163e1a4d40f521fbdaebb674658\"}',
    'currentBlockHeightExtSource': ''
  },
  'btm': { // coind is untested
    'name': 'Bitmark',
    'portp2p': 9266,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"BTM\",\"name\":\"Bitmark\",\"netmagic\":\"f9beb4d9\",\"p2p\":9265,\"rpc\":9266,\"pubval\":85,\"p2shval\":5,\"wifval\":213,\"txfee_satoshis\":\"0\",\"minconfirms\":2,\"genesishash\":\"c1fb746e87e89ae75bdec2ef0639a1f6786744639ce3d0ece1dcf979b79137cb\",\"genesis\":{\"hashalgo\":\"scrypt\",\"version\":1,\"timestamp\":1405274442,\"nBits\":\"1d00ffff\",\"nonce\":14385103,\"merkle_root\":\"d4715adf41222fae3d4bf41af30c675bc27228233d0f3cfd4ae0ae1d3e760ba8\"},\"alertpubkey\":\"04bf5a75ff0f823840ef512b08add20bb4275ff6e097f2830ad28645e28cb5ea4dc2cfd0972b94019ad46f331b45ef4ba679f2e6c87fd19c864365fadb4f8d2269\"}',
    'currentBlockHeightExtSource': ''
  },
  'carb': { // coind is untested
    'name': 'Carboncoin',
    'portp2p': 9351,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"CARB\",\"name\":\"Carboncoin\",\"netmagic\":\"abccbbdf\",\"p2p\":9350,\"rpc\":9351,\"pubval\":47,\"p2shval\":5,\"wifval\":175,\"txfee_satoshis\":\"0\",\"minconfirms\":2,\"genesishash\":\"a94f1aae8c409a0bd1e53cbca92d7e506b61c51d955cf56f76da501718d48d6c\",\"genesis\":{\"hashalgo\":\"scrypt\",\"version\":1,\"timestamp\":1389199888,\"nBits\":\"1e0ffff0\",\"nonce\":605268,\"merkle_root\":\"074bbb9d355731bfa8f67130e2179db7518d1387ad52e55309d4debe7d4e6383\"},\"alertpubkey\":\"046d6918a7c0c053aa942dbb8861499be4bd915c8bfb6a2b77b3787e207097cc2734b9321226ff107c1a95dae98570a66baec66e350d78ceba091b54411654d33f\"}',
    'currentBlockHeightExtSource': ''
  },
  'anc': { // coind is untested
    'name': 'AnonCoin',
    'portp2p': 28332,
    'user': 'user', // add your rpc pair here
    'pass': 'pass',
    'iguanaCurl': '{\"RELAY\":1,\"VALIDATE\":1,\"prefetchlag\":-1,\"protover\":70010,\"poll\":10,\"active\":1,\"agent\":\"iguana\",\"method\":\"addcoin\",\"maxpeers\":256,\"newcoin\":\"ANC\",\"name\":\"AnonCoin\",\"netmagic\":\"facabada\",\"p2p\":9377,\"rpc\":28332,\"pubval\":23,\"p2shval\":5,\"wifval\":151,\"txfee_satoshis\":\"2000000\",\"minconfirms\":2,\"genesishash\":\"00000be19c5a519257aa921349037d55548af7cabf112741eb905a26bb73e468\",\"genesis\":{\"version\":1,\"timestamp\":1370190760,\"nBits\":\"1e0ffff0\",\"nonce\":347089008,\"merkle_root\":\"7ce7004d764515f9b43cb9f07547c8e2e00d94c9348b3da33c8681d350f2c736\"},\"alertpubkey\":\"04c6db35c11724e526f6725cc5bd5293b4bc9382397856e1bcef7111fb44ce357fd12442b34c496d937a348c1dca1e36ae0c0e128905eb3d301433887e8f0b4536\"}',
    'currentBlockHeightExtSource': ''
  }
};