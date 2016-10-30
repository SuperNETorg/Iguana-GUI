/*!
 * Iguana dashboard/add-coin template
 *
 */

'use_strict';

templates.registerTemplate('addCoin',
'<section class=\"form-container mdl add-new-coin-form unselectable hidden fade\">' +
  '<div class=\"modal-overlay\"></div>' +
  '<div class=\"modal modal-add-coin\">' +
    '<div class=\"modal-dialog modal-popup\">' +
      '<div class=\"modal-content\">' +
        '<header class=\"form-header orange-gradient box-shadow-bottom\">' +
          '<i class=\"bi_interface-cross cursor-pointer btn-close\"></i>' +
          '<div class=\"title text-shadow\">' + helper.lang('ADD_COIN.ADDING_A_NEW_COIN') + '</div>' +
        '</header>' +
        '<div class=\"form-content\">' +
          '<div class=\"coins-title\">' + helper.lang('ADD_COIN.SELECT_COINS_TO_ADD') + '</div>' +
          '<div class=\"quick-search\">' +
            '<i class=\"icon bi_tool-magnifier\"></i>' +
            '<input type=\"text\" class=\"input text\" placeholder=\'' + helper.lang('ADD_COIN.FOR_EXAMPLE') + ', \"Bitcoin\"\' />' +
          '</div>' +
          '<div class=\"supported-coins-repeater\">' +
            '<div class=\"supported-coins-repeater-inner\"></div>' +
          '</div>' +
          '<button class=\"btn btn-block orange-gradient box-shadow-all text-shadow row btn-next disabled\">' + helper.lang('CREATE_ACCOUNT.NEXT') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</section>');