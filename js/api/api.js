/*!
 * Iguana api config
 *
 */

var apiProto = function() {};

var activeCoin,
    portsTested = false,
    isIguana = false,
    isRT = false,
    isProxy = true,
    iguanaNullReturnCount = 0,
    coinsInfo = new Array; // cointains coin related info

document.write('\x3Cscript type=\"text/javascript\" src=\"js/api/supported-coins-list.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/iguana-add-coin-list.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/connection-conf.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/connection-check.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/wallet-auth.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/server-status-check.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/rates.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/transactions.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/iguana-coin.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/balance.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/req-payload.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/get-address.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/send-coin.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/handlers.js\">\x3C/script>');

var api = new apiProto();