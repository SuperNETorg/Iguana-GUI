/*!
 * Iguana dashboard/dashboard template
 *
 */

var dashboardTemplate =
'<div class="container-fluid">' +
  '<div class="row">' +
    '<section class="dashboard hidden main">' +
      '<nav class="navbar top unselectable navbar-inverse">' +
        '<div class="container-fluid">' +
          '<div class="navbar-header">' +
            '<div class="navbar-brand">Iguana</div>' +
            '<div class="cursor-pointer lnk-logout">Log out</div>' +
          '</div>' +
          '<div class="top" id="top-menu">' +
            '<ul class="nav navbar-nav top-menu">' +
              '<li class="item cursor-pointer text-center active" data-url="dashboard">' +
                '<div class="text">Dashboard</div>' +
                '<div class="border"></div>' +
              '</li>' +
              '<li class="item cursor-pointer text-center" data-url="settings">' +
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
      '<div class="main-content container-fluid">' +
        '<!-- temp out of sync notice -->' +
        '<div id="temp-out-of-sync" class="hidden" style="color:red;text-aling:center;font-weight:bold;font-size:1.2em"></div>' +
        '<div class="balance-block unselectable">' +
          '<div class="label">Total balance:</div>' +
          '<div class="balance">' +
            '<span class="value"></span>' +
            '<span class="currency"></span>' +
          '</div>' +
        '</div>' +
        '<div class="clearfix"></div>' +
        '<aside class="coins unselectable col-md-3 col-sm-3 col-xs-12">' +
          '<div class="row">' +
            '<div class="account-coins-repeater">Loading...</div>' +
            '<button class="btn btn-add-coin">Add coin</button>' +
          '</div>' +
        '</aside>' +
        '<div class="transactions-unit col-md-8 col-sm-7 col-xs-12">' +
          '<div class="row">' +
            '<div class="top-bar unselectable">' +
              '<div class="active-coin-balance">' +
                '<span class="value"></span>' +
                '<span class="coin-name"></span>' +
              '</div>' +
              '<div class="active-coin-balance-currency">' +
                '<span class="value"></span>' +
                '<span class="currency"></span>' +
              '</div>' +
              '<div class="action-buttons unselectable">' +
                '<button class="btn btn-send">Send</button>' +
                '<button class="btn btn-receive coinaddress btn-lg" data-toggle="modal" data-target="#myModal">Receive</button>' +
              '</div>' +
              '<div class="info unselectable">' +
                '<i class="bi_doc-book-a"></i>' +
                '<span>Information</span>' +
              '</div>' +
              '<div class="clearfix"></div>' +
            '</div>' +
            '<div class="transactions-list">' +
            '<div class="title unselectable">History</div>' +
            '<div class="transactions-list-repeater">Loading...</div>' +
          '</div>' +
          '</div>' +
        '</div>' +
        '<div class="clearfix"></div>' +
      '</div>' +
    '</section>' +
    '<section class="form-container send-coin-form unselectable hidden fade">' +
      '<div class="modal-overlay"></div>' +
      '<div class="modal modal-send-coin"></div>' +
    '</section>' +
    '<!-- send coin passphrase conf -->' +
    '<section class="modal-append-container"></section>' +
  '</div>' +
'</div>';