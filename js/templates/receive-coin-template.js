/*!
 * Iguana dashboard/receive-coin-template
 *
 */

var receiveCoinTemplate =
'<section class="modal fade" id="myModal" role="dialog">' +
  '<div class="modal-dialog modal-popup modal-lg">' +
    '<div class="modal-content receiving-coin-content">' +
      '<header class="modal-header form-header orange-gradient box-shadow-bottom">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '<div class="modal-title title text-shadow">Receiving coins</div>' +
      '</header>' +
      '<div class="modal-body">' +
        '<div class="row">' +
          '<div class="col-xs-12 col-md-5 col-md-offset-3 share-address-section">' +
            '<div class="my-label my-address">My address:</div>' +
            '<h4 id="address"></h4>' +
            /*'<div>' +
              '<span class="text-section text-something">Something 2</span>' +
            '</div>' +*/
            '<div class="clearfix">' +
              '<div class="buttons text-center">' +
                '<a data-toggle="modal" href="#messageModal" class="btn copy-btn button-150 margin-right-15 margin-bottom" ' +
                    'onclick="copyToClipboard(\'#address\')">Copy</a>' +
                '<a href="#" class="btn btn-share-email button-150 share-btn margin-right-15 margin-bottom">Share</button>' +
                '</a>' +
              '</div>' +
              '<div class="qr-code" id="qr-code"></div>' +
              '<div class="col-sm-9 col-xs-10">' +
                '<div class="amount-label row">' +
                  '<span class="block amount-label-span">Amount:</span>' +
                  '<span class="block text-section enter-in-currency">Enter in {{ currency }}<!-- any currency --></span>' +
                '</div>' +
              '</div>' +
              '<div class="col-sm-12 col-xs-10">' +
                '<div class="row">' +
                  '<div class="input">' +
                    '<div class="currency-input inner-addon right-addon"  >' +
                      '<input type="number" class="input-150 crypto-currency currency-coin" placeholder="0">' +
                      '<span class="unit coin-unit glyphicon"></span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="">' +
                    '<div class="currency-input">' +
                      '<span class="equals-sign">=</span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="input">' +
                    '<div class="currency-input inner-addon right-addon">' +
                      '<input type="number" class="input-150 currency crypto-currency" placeholder="0">' +
                      '<span class="unit unit-currency glyphicon"></span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</section>';