/*!
 * Iguana dashboard/add-coin template
 *
 */

var addCoinModalTemplate =
'<section class=\"form-container mdl add-new-coin-form unselectable hidden fade\">' +
  '<div class=\"modal-overlay\"></div>' +
  '<div class=\"modal modal-add-coin\">' +
    '<header class=\"form-header orange-gradient box-shadow-bottom\">' +
      '<i class=\"bi_interface-cross cursor-pointer btn-close\"></i>' +
      '<div class=\"title text-shadow\">Adding a new coin</div>' +
    '</header>' +
    '<div class=\"form-content\">' +
      '<div class=\"coins-title\">Select coins to add</div>' +
      '<div class=\"quick-search\">' +
        '<i class=\"icon bi_tool-magnifier\"></i>' +
        '<input type=\"text\" class=\"input text\" placeholder=\'For example, \"Bitcoin\"\' />' +
      '</div>' +
      '<div class=\"supported-coins-repeater\">' +
        '<div class=\"supported-coins-repeater-inner\"></div>' +
      '</div>' +
      '<button class=\"btn btn-block orange-gradient box-shadow-all text-shadow row btn-next disabled\">Next</button>' +
    '</div>' +
  '</div>' +
'</section>';