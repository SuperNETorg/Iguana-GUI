Please see the Wiki at https://github.com/SuperNETorg/Iguana-GUI/wiki for more information.

#Iguana GUI

Iguana GUI can be used either with Iguana Core or with regular daemons like bitcoind, bitcoindarkd etc

##Dependencies in Iguana mode:##
Built Iguana Core https://github.com/jl777/SuperNET

You can start using the GUI right away in Iguana mode. However suttering and overall "slowness" can be experienced during coin sync process.

##Dependencies in non-Iguana mode aka coind:##
1) synced coind (start with small coins like syscoin, mazacoin or gamecredits)

2) proxy server (for dev purposes you can stick to https://github.com/gr2m/CORS-Proxy, **requires nodejs**)

3) coind must be configured with the following params (minimum configuration)

>server=1

>daemon=1

>rpcuser=yourusername

>rpcpassword=yourverylongandsecurepassword

>rpcport=altcoinport

4) modify script js/supported-coins-list.js accrording to your coind rpc credentials (optional)

You can specify your passphrases in js/dev.js. In this case those passphrases are going to be pre-loaded on a login step.
**Alert: it's unsafe, exercise caution!**