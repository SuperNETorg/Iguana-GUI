/*!
 * Iguana dashboard/dashboard template
 *
 */

'use_strict';

templates.registerTemplate('dashboard',
'<div class="container-fluid dashboard-main">' +
  '<div class="row">' +
    '<section class="dashboard hidden main">' +
      '<nav class="navbar top unselectable navbar-inverse">' +
        '<div class="clearfix">' +
          '<div class="navbar-header">' +
            '<div class="navbar-brand">' + helper.lang('DASHBOARD.IGUANA') + '</div>' +
            '<div class="cursor-pointer lnk-logout">' + helper.lang('DASHBOARD.LOGOUT') + '</div>' +
          '</div>' +
          '<div class="top" id="top-menu">' +
            '<ul class="nav navbar-nav top-menu">' +
              '<li class="item cursor-pointer text-center active" data-url="dashboard">' +
                '<div class="text">' + helper.lang('DASHBOARD.DASHBOARD') + '</div>' +
                '<div class="border"></div>' +
              '</li>' +
              '<li class="item cursor-pointer text-center" data-url="settings">' +
                '<div class="text">' + helper.lang('DASHBOARD.SETTINGS') + '</div>' +
                '<div class="border"></div>' +
              '</li>' +
              '<li class="item cursor-pointer text-center hidden" data-url="payments">' +
                '<div class="text">' + helper.lang('DASHBOARD.PAYMENTS') + '</div>' +
                '<div class="border"></div>' +
              '</li>' +
              '<li class="item cursor-pointer text-center hidden" data-url="contacts">' +
                '<div class="text">' + helper.lang('DASHBOARD.CONTACTS') + '</div>' +
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
          '<div class="label">' + helper.lang('DASHBOARD.TOTAL_BALANCE') + '</div>' +
          '<div class="balance">' +
            '<span class="value">0</span>' +
            '<span class="currency">{{ currency }}</span>' +
          '</div>' +
        '</div>' +
        '<div class="clearfix"></div>' +
        '<aside class="coins unselectable col-md-3 col-sm-3 col-xs-12">' +
          '<div class="row">' +
            '<div class="account-coins-repeater"></div>' +
            '<button class="btn btn-add-coin">' + helper.lang('DASHBOARD.ADD_COIN') + '</button>' +
          '</div>' +
        '</aside>' +
        '<div class="transactions-unit loading col-md-8 col-sm-7 col-xs-12 pull-right">' +
          '<div class="row">' +
            '<div class="top-bar unselectable">' +
              '{{ injectLoader }}' +
              '<div class="active-coin-balance">' +
                '<span class="value">0</span>' +
                '<span class="coin-name"></span>' +
              '</div>' +
              '<div class="active-coin-balance-currency">' +
                '<span class="value">0</span>' +
                '<span class="currency">{{ currency }}</span>' +
              '</div>' +
              '<div class="action-buttons unselectable">' +
                '<button class="btn btn-send">' + helper.lang('DASHBOARD.SEND') + '</button>' +
                '<button class="btn btn-receive coinaddress btn-lg" data-toggle="modal" data-target="#myModal">' + helper.lang('DASHBOARD.RECEIVE') + '</button>' +
              '</div>' +
              '<div class="info unselectable">' +
                '<i class="bi_doc-book-a"></i>' +
                '<span>' + helper.lang('DASHBOARD.INFORMATION') + '</span>' +
              '</div>' +
              '<div class="clearfix"></div>' +
            '</div>' +
            '<div class="transactions-list">' +
            '<div class="title unselectable">' + helper.lang('DASHBOARD.HISTORY') + '</div>' +
            '<div class="transactions-list-repeater">' + helper.lang('DASHBOARD.LOADING') + '...</div>' +
          '</div>' +
          '</div>' +
        '</div>' +
        '<div class="clearfix"></div>' +
      '</div>' +
    '</section>' +
    '<section class="form-container mdl send-coin-form unselectable hidden fade">' +
      '<div class="modal-overlay"></div>' +
      '<div class="modal modal-send-coin"></div>' +
    '</section>' +
    '<!-- send coin passphrase conf -->' +
    '<section class="modal-append-container"></section>' +
  '</div>' +
'</div>');