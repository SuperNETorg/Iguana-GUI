/*!
 * Iguana dashboard/send-coin-confirmation template
 *
 */

var sendCoinConfirmationTemplate =
  '<div class="send-coin-progress-overlay hidden">' +
    '<div class="send-coin-status">Sending...</div>' +
    '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-next">' +
      '<div class="progress-indicator">' +
        '<svg class="bag" height="24" width="24">' +
          '<circle cx="12" cy="12" r="10" stroke="transparent" stroke-width="2" fill="none"></circle>' +
        '</svg>' +
        '<svg class="over" height="24" width="24">' +
          '<circle cx="12" cy="12" r="10" stroke="#FFF" stroke-width="2" fill="none">' +
            '<animate attributeType="CSS" attributeName="stroke-dasharray" from="1,254" to="62,56" dur="5s" repeatCount="indefinite" />' +
          '</circle>' +
        '</svg>' +
      '</div>' +
    '</button>' +
  '</div>' +
  '<div class="send-coin-success-overlay hidden">' +
    '<div class="send-coin-status">Transaction is sent.<br/>Check the status in a few minutes to verify.</div>' +
    '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-confirmed">' +
      '<i class="bi_interface-tick cursor-pointer"></i>' +
    '</button>' +
  '</div>' +
  '<header class="form-header orange-gradient box-shadow-bottom">' +
    '<i class="bi_interface-arrow-left cursor-pointer btn-back"></i>' +
    '<div class="title text-shadow">Confirmation</div>' +
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
                '<span>17.5 BTC</span>' +
                '<p class="rs">11763.03 USD</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="pop-form">' +
            '<div class="pop-detail send check">' +
              '<h4>Send to:</h4>' +
              '<p>jfdsflkkljkfkldsjfjldsfjjdsfjkldsjfkljds</p>' +
            '</div>' +
            '<div class="pop-detail crncy chk-crncy crncy_btc_rs">' +
              '<h4>Amount:</h4>' +
                '<h3>1 BTC</h3>' +
                '<h5>or 192 USD</h5>' +
              '</div>' +
              '<div class="pop-detail crncy chk-crncy crncy_btc_fee">' +
                '<h4>Fee:</h4>' +
                '<h3>10 BTC</h3>' +
                '<h5>or 580 USD</h5>' +
              '</div>' +
              '<div class="pop-detail pay-dtl">' +
                '<h4>Note: </h4>' +
                '<p>This is my Payment. Have a nice day :)</p>' +
              '</div>' +
              '<input type="submit" value="Send 11 BTC" id="sendingModal" />' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';