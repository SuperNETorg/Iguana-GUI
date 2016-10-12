/*!
 * Iguana dashboard/send-coin-entry template
 *
 */

var sendCoinEntryTemplate =
  '<header class="form-header orange-gradient box-shadow-bottom">' +
    '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
    '<div class="title text-shadow">Sending</div>' +
  '</header>' +
  '<div class="form-content rs_modal">' +
    '<div class="modal-body">' +
      '<div class="main-popup">' +
        '<div class="popup-head">' +
          '<div class="headd">' +
            '<div class="row">' +
              '<div class="col-sm-6 hd-left col-xs-6">' +
                '<img src="images/bitcoin.png">' +
                '<span>Bitcoin</span>' +
              '</div>' +
              '<div class="col-sm-6 hd-right col-xs-6">' +
                '<span class="balance-coin"><span class="value">17.5</span> <span class="name">BTC</span></span>' +
                '<p class="rs balance-currency"><span class="value">11763.03</span> <span class="name">USD</span></p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="pop-form">' +
            '<div class="pop-detail send">' +
              '<h4>Send to:</h4>' +
              '<p>Enter a wallet Address or Select a Contact</p>' +
              '<input type="text" class="tx-address" />' +
            '</div>' +
            '<div class="pop-detail crncy">' +
              '<h4>Amount:</h4>' +
              '<p>Enter in any Currency</p>' +
              '<input type="text" placeholder="0 BTC" class="tx-amount" /><span>=</span><input type="text" placeholder="0 USD" />' +
            '</div>' +
            '<div class="pop-detail crncy">' +
              '<h4>Fee:</h4>' +
              '<p>Minimum fee. Increase it to speed up transaction.</p>' +
              '<input type="text" placeholder="1 BTC" class="tx-fee" /><span>=</span><input type="text" placeholder="580 USD" />' +
            '</div>' +
            '<div class="pop-detail">' +
              '<h4>Note (optional):</h4>' +
              '<textarea class="tx-note"></textarea>' +
            '</div>' +
            '<input type="submit" value="Next" id="nextsend" class="btn-next" />' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';