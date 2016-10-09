var currencyArr = [{ 'id': 0, 'shortName': 'USD', 'fullName': 'United States Dollar', 'flagid': 'us', 'selected': true },
                   { 'id': 1, 'shortName': 'EUR', 'fullName': 'Euro', 'flagid': 'eu' }];

// TODO: add currency localstorage cache
// note: current implementation doesn't permit too often updates
//       due to possibility of ban for abuse
$(document).ready(function(e) {
  var outPut = '',
      defaultActive = '',
      helper = new helperProto(),
      api = new apiProto();

  api.testConnection();

  for (var i in currencyArr)
  {
	  defaultActive = '';

    if ((helper.getCurrency() ? helper.getCurrency().name : null || settings.defaultCurrency) === currencyArr[i].shortName) {
      defaultActive = 'selected';
    }

    outPut += '<li class=\"country-li cursor-pointer ' + defaultActive + '\" data-id=\"' + currencyArr[i].id + '\">' +
                '<h1 class=\"flag-head\">' +
                  '<span class=\"label label-default\">' +
                    '<span class=\"flag-icon flag-icon-' + currencyArr[i].flagid + '\"></span>' +
                  '</span>' +
                '</h1>' +
                '<strong class=\"short-name\">' + currencyArr[i].shortName + '</strong>' +
                '<span class=\"full-name\">' + currencyArr[i].fullName + '</span>' +
              '</li>';
  }

  $('.currency-loop').html(outPut);
  	$('.country-li').on('click',function(){
      var id = $(this).attr('data-id');

      helper.setCurrency(currencyArr[id].shortName);
      defaultCurrency = currencyArr[id].shortName;
      updateRates(null, null, null, true);
      $('.country-li').removeClass('selected');
    	$(this).addClass('selected');
	});

  $('.top-menu .item').click(function() {
    $('.top-menu .item').each(function(index, item) {
      $(this).removeClass('active');
    });

    $(this).addClass('active');
    helper.openPage($(this).attr('data-url'));
  });

  $('.lnk-logout').click(function() {
    helper.logout();
  });
});