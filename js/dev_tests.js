/*!
 * Iguana dev tests file
 * info: nightwatchjs UAT
 */

dev = [];
dev.isNightwatch = true; // nightwatchjs, 'true' - bypass iguana coin daemon calls to respective coind server; 'false' - regular operation
dev.isKarma = false; // set to 'true' in karma e2e tests
dev.isDev = true; // keep always to 'true' in testing env
dev.showSyncDebug = false;
dev.showConsoleMessages = true;
dev.showAllCoindCoins = true;
dev.clearConsoleErrors = false;