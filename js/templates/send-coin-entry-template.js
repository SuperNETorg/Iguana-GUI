/*!
 * Iguana dashboard/send-coin-entry template
 *
 */

var sendCoinEntryTemplate =
'<div class="modal-dialog modal-popup">' +
  '<div class="modal-content">' +
    '<header class="form-header orange-gradient box-shadow-bottom">' +
      '<i class="bi_interface-cross cursor-pointer btn-close"></i>' +
      '<div class="title text-shadow">' + helper.lang('SEND.SENDING') + '</div>' +
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
                '<h4>' + helper.lang('SEND.SEND_TO') + ':</h4>' +
                '<p class="tx-address-validation">' + helper.lang('SEND.ENTER_A_WALLET_ADDRESS') + '<!-- or select a contact --></p>' +
                '<div class="inner-addon right-addon">' +
                  '<input type="text" class="tx-address" value="{{ address }}" />' +
                '<div class="tx-address-icon glyphicon"></div>' +
              '</div>' +
              '</div>' +
              '<div class="pop-detail crncy">' +
                '<h4>' + helper.lang('RECEIVE.AMOUNT') + ':</h4>' +
                '<p class="tx-amount-validation">' + helper.lang('RECEIVE.ENTER_IN') + ' {{ coin_id }} or {{ currency }}</p>' +
                '<input type="text" min="0" placeholder="0 {{ coin_id }}" class="tx-amount" value="{{ amount }}" /><span>=</span><input type="text" min="0" class="tx-amount-currency" placeholder="0 {{ currency }}" />' +
              '</div>' +
              '<div class="pop-detail crncy">' +
                '<h4>' + helper.lang('SEND.FEE_PER_KB') + ':</h4>' +
                '<p class="tx-fee-validation">' + helper.lang('SEND.MINIMUM_FEE') + '</p>' +
                '<input type="text" min="0" placeholder="0 {{ coin_id }}" class="tx-fee" value={{ fee }} /><span>=</span><input type="text" min="0" class="tx-fee-currency" placeholder="0 {{ currency }}" value="{{ fee_currency }}" />' +
              '</div>' +
              '<div class="pop-detail">' +
                '<h4>' + helper.lang('SEND.NOTE_OPTIONAL') + ':</h4>' +
                '<textarea class="tx-note">{{ note }}</textarea>' +
              '</div>' +
              '<button class="btn-next orange-gradient">' + helper.lang('CREATE_ACCOUNT.NEXT') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>';