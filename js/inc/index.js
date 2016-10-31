/*!
 * Iguana js/inc/index
 *
 */

// crypto libs
app.system.registerScript('libs/crypto/wordlist.js');
app.system.registerScript('libs/crypto/passphrasegenerator.js');
// libs
app.system.registerScript('libs/jquery-3.0.0.min.js');
app.system.registerScript('libs/jquery.qrcode.min.js');
app.system.registerScript('libs/bootstrap.min.js');
// lang
app.system.registerScript('lang/en.js');
app.system.registerScript('settings.js');
app.system.registerScript('dev.js');
app.system.registerScript('helpers/helpers.js');
app.system.registerScript('api/api.js');
app.system.registerScript('localstorage.js');
// templates
app.system.registerScript('templates/templates.js');
app.system.registerScript('templates/repeaters.js');
app.system.registerScript('templates/loader-template.js');
app.system.registerScript('templates/login-template.js');
app.system.registerScript('templates/signup-template.js');
// modal templates
app.system.registerScript('templates/message-modal-template.js');
app.system.registerScript('templates/add-coin-template.js');
app.system.registerScript('templates/add-coin-login-template.js');
app.system.registerScript('templates/add-coin-create-wallet-template.js');
app.system.registerScript('templates/send-coin-passphrase-template.js');
app.system.registerScript('templates/receive-coin-template.js');
// send coin templates
app.system.registerScript('templates/send-coin-entry-template.js');
app.system.registerScript('templates/send-coin-confirmation-template.js');
app.system.registerScript('templates/dashboard-template.js');
app.system.registerScript('templates/reference-currency-template.js');
// auth
app.system.registerScript('auth/wallet-create.js');
app.system.registerScript('auth/coind-auth.js');
app.system.registerScript('auth/bind-event.js');
app.system.registerScript('auth/init.js');
app.system.registerScript('auth/auth.js');
// dashboard logic
app.system.registerScript('dashboard/init.js');
app.system.registerScript('dashboard/left-sidebar.js');
app.system.registerScript('dashboard/balance.js');
app.system.registerScript('dashboard/transactions-unit.js');
app.system.registerScript('dashboard/add-coin.js');
app.system.registerScript('dashboard/receive-coin.js');
app.system.registerScript('dashboard/rates.js');
app.system.registerScript('dashboard/dashboard.js');
app.system.registerScript('dashboard/send-to-address.js');
app.system.registerScript('dashboard/supported-currencies.js');
app.system.registerScript('dashboard/reference-currency.js');
app.system.registerScript('start.js');