/*!
 * Iguana dashboard/send-coin-confirmation template
 *
 */

'use_strict';

templates.registerTemplate('sendCoinConfirmation',
'<div class="modal-dialog modal-popup">' +
  '<div class="modal-content">' +
    /*'<div class="send-coin-progress-overlay hidden">' +
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
    '</div>' +*/
    '<div class="send-coin-success-overlay hidden">' +
      '<div class="send-coin-status">' + helper.lang('SEND.TRANSACTION_IS_SENT') + '.<br/>' + helper.lang('SEND.TRANSACTION_IS_SENT') + '.</div>' +
      '<button class="btn btn-block orange-gradient box-shadow-all text-shadow row btn-confirmed">' +
        '<i class="bi_interface-tick cursor-pointer"></i>' +
      '</button>' +
    '</div>' +
    '<header class="form-header orange-gradient box-shadow-bottom">' +
      '<i class="bi_interface-arrow-left cursor-pointer btn-back"></i>' +
      '<div class="title text-shadow">' + helper.lang('SEND.CONFIRMATION') + '</div>' +
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
              '<div class="pop-detail send check">' +
                '<h4>' + helper.lang('SEND.SEND_TO') + ':</h4>' +
                '<p>{{ tx_coin_address }}</p>' +
              '</div>' +
              '<div class="pop-detail crncy chk-crncy crncy-rs">' +
                '<h4>' + helper.lang('RECEIVE.AMOUNT') + ':</h4>' +
                  '<h3>{{ tx_coin_amount }} {{ coin_id }}</h3>' +
                  '<h5>or {{ tx_coin_amount_currency }} {{ currency }}</h5>' +
                '</div>' +
                '<div class="pop-detail crncy chk-crncy crncy-fee">' +
                  '<h4>' + helper.lang('SEND.FEE_PER_KB') + ':</h4>' +
                  '<h3>{{ tx_coin_fee_value }} {{ coin_id }}</h3>' +
                  '<h5>' + helper.lang('LOGIN.OR') + ' {{ tx_coin_fee_currency }} {{ currency }}</h5>' +
                '</div>' +
                '<div class="pop-detail pay-dtl">' +
                  '<h4>' + helper.lang('SEND.FEE_PER_KB') + ': </h4>' +
                  '<p>{{ tx_note }}</p>' +
                '</div>' +
                '<h4>' + helper.lang('SEND.THE_FINAL_AMOUNT') + '.</h4>' +
                '<button class="btn-confirm-tx orange-gradient">' + helper.lang('SEND.SEND') + ' {{ tx_total }} {{ coin_id }}</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>');