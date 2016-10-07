/*!
 * Iguana dashboard/add-coin
 *
 */

var addCoinColors = ['orange', 'breeze', 'light-blue', 'yellow'];

function addCoinButtonCB() {
  var helper = new helperProto();
      coinsSelectedToAdd = [];

  if (!$('.add-new-coin-form').hasClass('fade')) $('.add-new-coin-form').addClass('fade');
  helper.toggleModalWindow('add-new-coin-form', 300);

  $('.supported-coins-repeater-inner').html(constructCoinRepeater());
  bindClickInCoinRepeater();
  opacityToggleOnAddCoinRepeaterScroll();
  $('.supported-coins-repeater').scroll(function(e) {
    opacityToggleOnAddCoinRepeaterScroll();
  });
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

function opacityToggleOnAddCoinRepeaterScroll() {
  var supportedCoinsRepeaterScrollPos = $('.supported-coins-repeater').scrollTop() || 0,
      lowerThreshold =  supportedCoinsRepeaterScrollPos + $('.supported-coins-repeater-inner').height();

  $('.supported-coins-repeater .coin').each(function(index, item) {
    // position().top of the first el is 264
    // 132 is half of that
    // opacity change kicks in at around the middle of a tile line
    // 400 is repeater max-height after which scroll bar appears on the screen
    var itemTop = $(this).position().top - 132 >= 0 ? $(this).position().top - 132 : $(this).position().top,
        itemBottom = $(this).position().top - 132 >= 0 ? $(this).position().top : $(this).position().top + 132;

    if (itemTop + 26 > supportedCoinsRepeaterScrollPos && itemBottom + 26 < lowerThreshold || $('.supported-coins-repeater-inner').height() < 400) {
      $(this).css({ 'opacity': 1 }); // shortcut, better to use css class
    } else {
      $(this).css({ 'opacity': 0.2 });
    }
  });
}

function bindClickInCoinRepeater() {
  $('.supported-coins-repeater-inner .coin').each(function(index, item) {
    $(this).click(function() {
      if ($(this).hasClass('active')) {
        delete coinsSelectedToAdd[index];
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
        coinsSelectedToAdd[index] = $(this).attr('data-coin-id');
      }
    });
  });
}

function bindCoinRepeaterSearch() {
  $('.quick-search .input').keyup(function() {
    var quickSearchVal = $(this).val().toLowerCase();

    $('.supported-coins-repeater-inner .coin .name').each(function(index, item) {
      var itemText = $(item).text().toString().toLowerCase();

      if (itemText.indexOf(quickSearchVal) > -1) $(this).parent().removeClass('fade');
      else $(this).parent().addClass('fade');
    });

    // fade in elements if nothing was found
    if ($('.supported-coins-repeater-inner .coin').filter('.fade').length === Object.keys(supportedCoinsList).length)
      $('.supported-coins-repeater-inner .coin').filter('.fade').removeClass('fade');
  });
}