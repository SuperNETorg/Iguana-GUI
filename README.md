Please see the Wiki at https://github.com/SuperNETorg/Iguana-GUI/wiki for more information.

#Iguana GUI
Iguana GUI can be used either with Iguana Core or with regular daemons like bitcoind, bitcoindarkd etc

##Dependencies in Iguana mode:##
Built Iguana Core https://github.com/jl777/SuperNET

You can start using the GUI right away in Iguana mode. However suttering and overall "slowness" can be experienced during coin sync process.

##Dependencies for Non-Iguana mode:##
1) Needed daemons are downloaded, synced and run,
2) Daemons has the minimum configuration with the params:
server=1>>
daemon=1
rpcuser=yourusername
rpcpassword=yourverylongandsecurepassword
rpcport=altcoinport

3) Proxy server is set up,

(optionally)
4)  Supported coins script is modified accordingly to respective blockchain RPC-credentials.
