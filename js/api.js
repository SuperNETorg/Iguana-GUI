/*!
 * Iguana api config
 *
 */

// TODO: 1) add response handler
//       2) generalize get/post functions into one
//      (?) refactor conf into a singleton obj

var apiProto = function() {};

var activeCoin,
    portsTested = false,
    isIguana = false,
    isRT = false,
    coinsInfo = new Array; // cointains coin related info

document.write('\x3Cscript type=\"text/javascript\" src=\"js/api/connection-conf.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/connection-check.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/wallet-auth.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/server-status-check.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/rates.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/transactions.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/iguana-coin.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/balance.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/req-payload.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/api/handlers.js\">\x3C/script>');