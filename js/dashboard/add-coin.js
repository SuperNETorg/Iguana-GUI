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
      index = 0,
      localStorage = new localStorageProto();

  for (var key in supportedCoinsList) {
    if (localStorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes') {
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
      // height + margin top + margin bottom
      supportedCoinsRepeaterHeight = $('.supported-coins-repeater').height() + Number($('.supported-coins-repeater').css('padding').replace('px', '')) * 2,
      lowerThreshold = supportedCoinsRepeaterScrollPos + supportedCoinsRepeaterHeight;

  $('.supported-coins-repeater .coin').each(function(index, item) {
    // opacity change kicks in at around the middle of a tile line
    var elHeight = $(this).outerHeight() + Number($(this).css('margin').replace('px', '')) * 2, // height + margin top + margin bottom
        elAbsoluteTopPos = elHeight * 2 + Number($(this).css('paddingTop').replace('px', '')),
        elTop = Math.floor($(this).offset().top + supportedCoinsRepeaterScrollPos - elAbsoluteTopPos), // first line of tiles should have 0 top pos
        elBottom = Math.floor($(this).offset().top + supportedCoinsRepeaterScrollPos - elAbsoluteTopPos + elHeight); // bottom = top + el height

    if (elTop + Math.floor(elHeight / 1.5) <= supportedCoinsRepeaterScrollPos || elBottom - Math.floor(elHeight / 3.5) >= lowerThreshold) {
      $(this).css({ 'opacity': 0.2 }); // shortcut, better to use css class
    } else {
      $(this).css({ 'opacity': 1 });
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

      if (Object.keys(coinsSelectedToAdd).length === 0) $('.btn-next').addClass('disabled');
      else $('.btn-next').removeClass('disabled');
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