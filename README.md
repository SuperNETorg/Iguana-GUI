###Iguana###
Iguana helps people and companies to benefit with top-notch cryptocurrency- and blockchain-based technologies.

It is an open-source application working on the unique Iguana engine, which functions as a simple daemon, but provides an extremely wide platform for all existing and future cryptocurrecnies, classic financial assets and desentralised applications (DAPPs). 

The app also may serve as a monocoin-wallet (Non-Iguana mode) giving a better user experience then command line wallets for many altcoins or most popular in the market bitcoin-wallets. Though running a Non-Iguana monocoin wallet requires the following depencies to be met:

###Dependencies for Non-Iguana mode###

1) Needed daemons are downloaded, synced and run,
2) Daemons has the minimum configuration with the params:

>server=1
>daemon=1
>rpcuser=yourusername
>rpcpassword=yourverylongandsecurepassword
>rpcport=altcoinport

3) Proxy server is set up, (optionally)
4)  Supported coins script is modified accordingly to respective blockchain RPC-credentials

You can specify your passphrases in js/dev.js. In this case those passphrases are going to be pre-loaded on a login step.
**Alert: it's unsafe, exercise caution!**

Full feature narrative and development environment setup guides may be found in the wiki https://github.com/SuperNETorg/Iguana-application/wiki