/*!
 * Iguana dashboard/add-coin
 *
 */

var addCoinColors = ['orange', 'breeze', 'light-blue', 'yellow'];

function addCoinButtonCB() {
  coinsSelectedToAdd = [];

  if (!$('.add-new-coin-form').hasClass('fade')) $('.add-new-coin-form').addClass('fade');
  helper.toggleModalWindow('add-new-coin-form', 300);

  $('.supported-coins-repeater-inner').html(constructCoinRepeater());
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
    if ((!localstorage.getVal('iguana-' + key + '-passphrase') || (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes')) || helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
      if ((isIguana && coinsInfo[key].iguana !== false) || (!isIguana && coinsInfo[key].connection === true))
        result += coinRepeaterTemplate.
                  replace('{{ id }}', key.toUpperCase()).
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
  $('.supported-coins-repeater-inner .coin').each(function(index, item) {
    $(this).click(function() {
      var selectionStatus = $(this).hasClass('active') ? true : false;

      if (!isIguana || helper.getCurrentPage() === 'create-account') {
        $('.supported-coins-repeater-inner .coin').removeClass('active');
        coinsSelectedToAdd = [];
      }

      if ($(this).hasClass('active')) {
        delete coinsSelectedToAdd[index];
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
        coinsSelectedToAdd[index] = $(this).attr('data-coin-id');
      }

      // TODO: ugly, double check
      if (selectionStatus) {
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
      }

      if (Object.keys(coinsSelectedToAdd).length === 0) $('.btn-next').addClass('disabled');
      else $('.btn-next').removeClass('disabled');
    });
  });
}

function bindCoinRepeaterSearch() {
  $('.quick-search .input').keyup(function() {
    var quickSearchVal = $(this).val().toLowerCase();

    $('.supported-coins-repeater').addClass('override-opacity');
    $('.supported-coins-repeater-inner .coin .name').each(function(index, item) {
      var itemText = $(item).text().toString().toLowerCase();

      if (itemText.indexOf(quickSearchVal) > -1) $(this).parent().removeClass('fade');
      else $(this).parent().addClass('fade');
    });

    // fade in elements if nothing was found
    if ($('.supported-coins-repeater-inner .coin').filter('.fade').length === $('.supported-coins-repeater-inner .coin').length ||
        $('.supported-coins-repeater-inner .coin').filter('.fade').length === 0) {
      $('.supported-coins-repeater-inner .coin').filter('.fade').removeClass('fade');
      $('.supported-coins-repeater').removeClass('override-opacity');
    }
  });
}