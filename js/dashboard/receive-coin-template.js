/*!
 * Iguana dashboard/receive-coin-template
 *
 */

var receiveCoinTemplate =
'<section class="modal fade" id="myModal" role="dialog">' +
  '<div class="modal-dialog model-popup">' +
    '<div class="modal-content receiving-coin-content">' +
      '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
        '<h4 class="modal-title">Receiving coins</h4>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="row">' +
          '<div class="col-xs-12 col-md-5 col-md-offset-3 share-address-section">' +
            '<div class="my-lable">My address:</div>' +
            '<h4 id="address">32ro Y89f h8OF hfOO PIFO FJ9w hio1 132y</h4>' +
            '<div>' +
              '<span class="text-section text-something">Something 2</span>' +
            '</div>' +
            '<div class="col-md-6 buttons">' +
              '<button type="button" class="copy-btn" onclick="copyToClipboard(\'#address\')">' +
                '<a data-toggle="modal" href="#clipboard">Copy</a>' +
              '</button>' +
            '</div>' +
            '<div class="col-md-6 buttons">' +
              '<a href="#" class="bt-share-email">' +
                '<button type="button" class="share-btn">Share</button>' +
              '</a>' +
            '</div>' +
            '<div class="qr-code" id="qr-code"></div>' +
            '<div class="amount-lable">' +
              '<span class="amount-lable-span">Amount:</span>' +
            '</div>' +
            '<div>' +
              '<span class="text-section">Enter in any currency</span>' +
            '</div>' +
            '<div class="currency-input">' +
              '<input type="number" class="crypto-currency currency-coin" placeholder="0">' +
              '<span class="unit coin-unit"></span>' +
            '</div>' +
            '<div class="currency-input">' +
              '<span class="equals-sign">=</span>' +
            '</div>' +
            '<div class="currency-input">' +
              '<input type="number" class="currency crypto-currency" placeholder="0">' +
              '<span class="unit unit-currency">USD</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '<div class="modal fade" id="clipboard" role="dialog">' +
    '<div class="modal-dialog">' +
      '<div class="modal-content msg-content">' +
        '<div class="modal-header msgbox-header">' +
          '<div class="clipboard-msg">Address is copied to clipboard</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</section>';