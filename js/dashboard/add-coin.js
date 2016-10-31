/*!
 * Iguana dashboard/add-coin
 *
 */

var addCoinColors = ['orange', 'breeze', 'light-blue', 'yellow'];

function addCoinButtonCB() {
  var supportedCoinsRepeaterClassName = '.supported-coins-repeater',
      addNewCoinForm = $('.add-new-coin-form'),
      fadeClassName = 'fade';

  coinsSelectedToAdd = [];

  if (!addNewCoinForm.hasClass(fadeClassName)) addNewCoinForm.addClass(fadeClassName);
  helper.toggleModalWindow('add-new-coin-form', 300);

  $(supportedCoinsRepeaterClassName + '-inner').html(constructCoinRepeater());
  bindClickInCoinRepeater();
  opacityToggleOnAddCoinRepeaterScroll();
  $(supportedCoinsRepeaterClassName).scroll(function(e) {
    opacityToggleOnAddCoinRepeaterScroll();
  });
}

// construct coins to add array
function constructCoinRepeater() {
  var result = '',
      index = 0;

  for (var key in supportedCoinsList) {
    if ((!localstorage.getVal('iguana-' + key + '-passphrase') || (localstorage.getVal('iguana-' + key + '-passphrase') && localstorage.getVal('iguana-' + key + '-passphrase').logged !== 'yes')) || helper.getCurrentPage() === 'login' || helper.getCurrentPage() === 'create-account') {
      if ((isIguana && coinsInfo[key].iguana !== false) || (!isIguana && coinsInfo[key].connection === true))
        result += templates.all.repeaters.addCoinItem.
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
  var activeClassName = 'active',
      disabledClassName = 'disabled',
      supportedCoinsRepeaterCoin = $('.supported-coins-repeater-inner .coin'),
      buttonNext = $('.btn-next');

  supportedCoinsRepeaterCoin.each(function(index, item) {
    $(this).click(function() {
      var selectionStatus = $(this).hasClass(activeClassName) ? true : false;

      if (!isIguana || helper.getCurrentPage() === 'create-account') {
        supportedCoinsRepeaterCoin.removeClass(activeClassName);
        coinsSelectedToAdd = [];
      }

      if ($(this).hasClass(activeClassName)) {
        delete coinsSelectedToAdd[index];
        $(this).removeClass(activeClassName);
      } else {
        $(this).addClass(activeClassName);
        coinsSelectedToAdd[index] = $(this).attr('data-coin-id');
      }

      // TODO(?): rewrite

      if (selectionStatus) {
        $(this).removeClass(activeClassName);
        buttonNext.addClass(disabledClassName);
      } else {
        $(this).addClass(activeClassName);
        buttonNext.removeClass(disabledClassName);
      }
    });
  });
}

function bindCoinRepeaterSearch() {
  var fadeClassName = 'fade',
      overrideOpacityClassName = 'override-opacity',
      supportedCoinsRepeater = $('.supported-coins-repeater'),
      supportedCoinsRepeaterCoin = $('.supported-coins-repeater-inner .coin');

  $('.quick-search .input').keyup(function() {
    var quickSearchVal = $(this).val().toLowerCase();

    supportedCoinsRepeater.addClass(overrideOpacityClassName);
    $('.supported-coins-repeater-inner .coin .name').each(function(index, item) {
      var itemText = $(item).text().toString().toLowerCase();

      if (itemText.indexOf(quickSearchVal) > -1) $(this).parent().removeClass(fadeClassName);
      else $(this).parent().addClass(fadeClassName);
    });

    // fade in elements if nothing was found
    if (supportedCoinsRepeaterCoin.filter('.' + fadeClassName).length === supportedCoinsRepeaterCoin.length ||
        supportedCoinsRepeaterCoin.filter('.' + fadeClassName).length === 0) {
      supportedCoinsRepeaterCoin.filter('.' + fadeClassName).removeClass(fadeClassName);
      supportedCoinsRepeater.removeClass(overrideOpacityClassName);
      opacityToggleOnAddCoinRepeaterScroll();
    }
  });
}