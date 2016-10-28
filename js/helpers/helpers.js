/*!
 * Iguana helpers
 * info: various reusable functions go here
 */

var helperProto = function() {};

var defaultSessionLifetime = settings.defaultSessionLifetime,
    portPollUpdateTimeout = settings.portPollUpdateTimeout,
    pasteTextFromClipboard = false,
    isExecCopyFailed = false,
    coindWalletLockResults = [],
    coindWalletLockCount = 0;

document.write('\x3Cscript type=\"text/javascript\" src=\"js/helpers/auth.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/clipboard.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/currency.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/format.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/lang.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/message.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/modal.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/port-poll.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/router.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/time.js\">\x3C/script>' +
               '\x3Cscript type=\"text/javascript\" src=\"js/helpers/sync-status.js\">\x3C/script>');

var helper = new helperProto();