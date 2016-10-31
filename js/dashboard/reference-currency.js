/*!
 * Iguana dashboard/reference-currency
 *
 */

// note: current implementation doesn't permit too often updates
//       due to possibility of ban for abuse

function initReferenceCurrency() {
  var outPut = '',
      defaultActive = '';

  var index = 0;
  for (var i in currencyArr)
  {
    defaultActive = '';

    if ((helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency) === currencyArr[i].shortName) {
      defaultActive = 'selected';
    }

    outPut += templates.all.repeaters.currencyItem.
              replace('{{ defaultActive }}', defaultActive).
              replace('{{ index }}', index).
              replace('{{ flagId }}', currencyArr[i].flagid).
              replace('{{ shortName }}', currencyArr[i].shortName).
              replace('{{ fullName }}', currencyArr[i].fullName);
    index++;
  }

  $('.currency-loop').html(outPut);

  var country = $('.country-li');
  country.on('click',function(){
    var id = $(this).attr('data-id');

    helper.setCurrency(currencyArr[id].shortName);
    defaultCurrency = currencyArr[id].shortName;
    updateRates(null, null, null, true);
    country.removeClass('selected');
    $(this).addClass('selected');
  });

  var topMenuItem = $('.top-menu .item');
  topMenuItem.click(function() {
    topMenuItem.each(function(index, item) {
      $(this).removeClass('active');
    });

    $(this).addClass('active');
    helper.openPage($(this).attr('data-url'));
  });

  $('.lnk-logout').click(function() {
    helper.logout();
  });
}