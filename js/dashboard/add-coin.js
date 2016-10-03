/*!
 * Iguana dashboard/add-coin
 *
 */
 // TODO: add coin tile opacity change on viewport leave

var addCoinColors = ['orange', 'breeze', 'light-blue', 'yellow'];

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

// construct coins to add array
function constructCoinRepeater() {
  var result = '',
      index = 0;

  for (var key in supportedCoinsList) {
    if ((coinsInfo[key] && coinsInfo[key].connection !== true && isIguana) ||
      (coinsInfo[key] && coinsInfo[key].connection === true &&
       $('.account-coins-repeater').html().indexOf('data-coin-id=\"' + key + '\"') === -1 && !isIguana)) {
      if ((isIguana && coinsInfo[key].iguana !== false) || !isIguana)
        result += coinRepeaterTemplate.replace('{{ id }}', key.toUpperCase()).
                                       replace('{{ coin_id }}', key.toLowerCase()).
                                       replace('{{ name }}', supportedCoinsList[key].name).
                                       replace('{{ color }}', addCoinColors[index]);
        index++;
        if (index === addCoinColors.length - 1) index = 0;
    }
  }

  return result;
}

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