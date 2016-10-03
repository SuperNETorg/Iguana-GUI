/*!
 * Iguana dashboard/add-coin
 *
 */

function addCoinButtonCB() {
  var helper = new helperProto();

  if (!$('.add-new-coin-form').hasClass('fade')) $('.add-new-coin-form').addClass('fade');
  helper.toggleModalWindow('add-new-coin-form', 300);
  coinsSelectedByUser = [];
  $('.supported-coins-repeater').html(constructCoinRepeater());
  bindClickInCoinRepeater();
}

var coinRepeaterTemplate = '<div class=\"coin\" data-coin-id=\"{{ coin_id }}\">' +
                              '<i class=\"icon cc {{ id }}-alt col-{{ color }}\"></i>' +
                              '<div class=\"name\">{{ name }}</div>' +
                           '</div>';

function bindClickInCoinRepeater() {
  $('.supported-coins-repeater .coin').each(function(index, item) {
    $(this).click(function() {
      if ($(this).hasClass('active')) {
        delete coinsSelectedByUser[index];
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
        coinsSelectedByUser[index] = $(this).attr('data-coin-id');
      }
    });
  });
}

function bindCoinRepeaterSearch() {
  $('.quick-search .input').keyup(function() {
    var quickSearchVal = $(this).val().toLowerCase();

    $('.supported-coins-repeater .coin .name').each(function(index, item) {
      var itemText = $(item).text().toString().toLowerCase();

      if (itemText.indexOf(quickSearchVal) > -1) $(this).parent().removeClass('fade');
      else $(this).parent().addClass('fade');
    });

    // fade in elements if nothing was found
    if ($('.supported-coins-repeater .coin').filter('.fade').length === availableCoinsToAdd.length)
      $('.supported-coins-repeater .coin').filter('.fade').removeClass('fade');
  });
}