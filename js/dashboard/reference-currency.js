// TODO: add currency localstorage cache
// note: current implementation doesn't permit too often updates
//       due to possibility of ban for abuse

var referenceCurrencyItemTemplate =
  '<li class=\"country-li cursor-pointer {{ defaultActive }}\" data-id=\"{{ index }}\">' +
    '<h1 class=\"flag-head\">' +
      '<span class=\"label label-default\">' +
        '<span class=\"flag-icon flag-icon-{{ flagId }}\"></span>' +
      '</span>' +
    '</h1>' +
    '<strong class=\"short-name\">{{ shortName }}</strong>' +
    '<span class=\"full-name\">{{ fullName }}</span>' +
  '</li>';

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

    outPut += referenceCurrencyItemTemplate.
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