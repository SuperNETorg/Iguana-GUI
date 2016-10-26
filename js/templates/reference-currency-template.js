/*!
 * Iguana dashboard/reference currency template
 *
 */

var referenceCurrencyTemplate =
'<section class="dashboard unselectable">' +
  '<nav class="navbar top unselectable navbar-inverse">' +
    '<div class="container-fluid">' +
      '<div class="navbar-header">' +
        '<div class="navbar-brand">Iguana</div>' +
        '<div class="cursor-pointer lnk-logout">Log out</div>' +
      '</div>' +
      '<div class="top" id="top-menu">' +
        '<ul class="nav navbar-nav top-menu">' +
          '<li class="item cursor-pointer text-center " data-url="dashboard">' +
            '<div class="text">Dashboard</div>' +
            '<div class="border"></div>' +
          '</li>' +
          '<li class="item cursor-pointer text-center active" data-url="settings">' +
            '<div class="text">Settings</div>' +
            '<div class="border"></div>' +
          '</li>' +
          '<li class="item cursor-pointer text-center hidden" data-url="payments">' +
            '<div class="text">Payments</div>' +
            '<div class="border"></div>' +
          '</li>' +
          '<li class="item cursor-pointer text-center hidden" data-url="contacts">' +
            '<div class="text">Contacts</div>' +
            '<div class="border"></div>' +
          '</li>' +
        '</ul>' +
        '<div class="nav-buttons">' +
          '<div class="nav-left"></div>' +
          '<div class="nav-right"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</nav>' +
  '<div class="container-fluid reference-currency-main">' +
    '<div class="row">' +
      '<div class="container">' +
        '<div class="currency-content">' +
          '<div class="col-xs-12 col-md-5 col-sm-5 container-left">' +
            '<h3 class="choose-currency">Reference currency:</h3>' +
            '<h4 class="transaction-amount">Choose your currency to see equivalent</h4>' +
            '<h4 class="transaction-amount">amount of transactions</h4>' +
          '</div>' +
          '<div class="col-xs-12 col-sm-6 col-md-7 currency-parent">' +
            '<ul class="currency-loop"></ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</section>';