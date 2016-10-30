/*!
 * Iguana dashboard/receive-coin-template
 *
 */

'use_strict';

templates.registerTemplate('receiveCoin',
'<section class="modal fade" id="myModal" role="dialog">' +
  '<div class="modal-dialog modal-popup modal-lg">' +
    '<div class="modal-content receiving-coin-content">' +
      '<header class="modal-header form-header orange-gradient box-shadow-bottom">' +
        '<i class="bi_interface-cross cursor-pointer btn-close pull-left" data-dismiss="modal"></i>' +
        '<div class="text-center title text-shadow">' + helper.lang('RECEIVE.RECEIVING_COINS') + '</div>' +
      '</header>' +
      '<div class="modal-body">' +
        '<div class="share-address-section">' +
          /*'<div>' +
            '<span class="text-section text-something">Something 2</span>' +
          '</div>' +*/
          '<div class="my-label my-address">' + helper.lang('RECEIVE.MY_ADDRESS') + ':</div>' +
          '<h4 id="address"></h4>' +
          '<div class="buttons text-center">' +
            '<a data-toggle="modal" href="#messageModal" class="btn copy-btn margin-bottom pull-left" ' +
                'onclick="copyToClipboard(\'#address\')">' + helper.lang('RECEIVE.COPY') + '</a>' +
            '<a href="#" class="btn btn-share-email share-btn margin-bottom pull-right">' + helper.lang('RECEIVE.SHARE') + '</button>' +
            '</a>' +
          '</div>' +
          '<div class="qr-code" id="qr-code"></div>' +
          '<div class="col-xs-12">' +
            '<div class="amount-label row">' +
              '<span class="block amount-label-span">' + helper.lang('RECEIVE.AMOUNT') + ':</span>' +
              '<span class="block text-section enter-in-currency">' + helper.lang('RECEIVE.ENTER_IN') + ' {{ currency }}<!-- any currency --></span>' +
            '</div>' +
          '</div>' +
          '<div class="col-xs-12">' +
            '<div class="row">' +
              '<div class="input">' +
                '<div class="currency-input inner-addon right-addon"  >' +
                  '<input type="text" min="0" class="crypto-currency currency-coin" placeholder="0">' +
                  '<span class="unit coin-unit glyphicon"></span>' +
                '</div>' +
              '</div>' +
              '<div class="currency-input input-addon">' +
                '<span class="equals-sign">=</span>' +
              '</div>' +
              '<div class="input">' +
                '<div class="currency-input inner-addon right-addon">' +
                  '<input type="text" min="0" class="crypto-currency currency" placeholder="0">' +
                  '<span class="unit unit-currency glyphicon"></span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="clearfix"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</section>');