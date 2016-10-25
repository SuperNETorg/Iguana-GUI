/*!
 * Iguana dashboard/send-coin-entry template
 *
 */

var sendCoinEntryTemplate =
  '<header class="form-header orange-gradient box-shadow-bottom">' +
    '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
    '<div class="title text-shadow">Sending</div>' +
  '</header>' +
  '<div class="form-content send-modal">' +
    '<div class="modal-body">' +
      '<div class="main-popup">' +
        '<div class="popup-head">' +
          '<div class="headd orange-gradient">' +
            '<div class="row">' +
              '<div class="col-sm-6 hd-left col-xs-6 coin">' +
                '<i class="icon cc {{ coin_id }}-alt"></i>' +
                '<span class="name">{{ coin_name }}</span>' +
              '</div>' +
              '<div class="col-sm-6 hd-right col-xs-6 balance">' +
                '<span class="balance-coin"><span class="value">{{ coin_value }}</span> <span class="name">{{ coin_id }}</span></span>' +
                '<p class="rs balance-currency"><span class="value">{{ currency_value }}</span> <span class="name">{{ currency }}</span></p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="pop-form">' +
            '<div class="pop-detail send">' +
              '<h4>Send to:</h4>' +
              '<p class="tx-address-validation">Enter a wallet address<!-- or select a contact --></p>' +
              '<div class="inner-addon right-addon">' +
                '<input type="text" class="tx-address" value="{{ address }}" />' +
              '<div class="tx-address-icon glyphicon"></div>' +
            '</div>' +
            '</div>' +
            '<div class="pop-detail crncy">' +
              '<h4>Amount:</h4>' +
              '<p class="tx-amount-validation">Enter in {{ coin_id }} or {{ currency }}</p>' +
              '<input type="text" min="0" placeholder="0 {{ coin_id }}" class="tx-amount" value="{{ amount }}" /><span>=</span><input type="text" min="0" class="tx-amount-currency" placeholder="0 {{ currency }}" />' +
            '</div>' +
            '<div class="pop-detail crncy">' +
              '<h4>Fee (per KB of data):</h4>' +
              '<p class="tx-fee-validation">Minimum fee. Increase it to speed up transaction.</p>' +
              '<input type="text" min="0" placeholder="0 {{ coin_id }}" class="tx-fee" value={{ fee }} /><span>=</span><input type="text" min="0" class="tx-fee-currency" placeholder="0 {{ currency }}" value="{{ fee_currency }}" />' +
            '</div>' +
            '<div class="pop-detail">' +
              '<h4>Note (optional):</h4>' +
              '<textarea class="tx-note">{{ note }}</textarea>' +
            '</div>' +
            '<button class="btn-next orange-gradient">Next</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';