/*
* Iguana/Top Nav Bar
*
* */

// on les then 768px working this function//
initTopNavBar = function () {
  var topMenu = $('#top-menu');
  var btnLeft = $('.nav-buttons .nav-left', topMenu),
    btnRight = $('.nav-buttons .nav-right', topMenu),
    items = $('.item', topMenu), itemsLength = 0, item;

  btnLeft.on('click swipeleft', function () {
    debugger;
    if ($(window).width() < $('.top-menu', topMenu).width()) {
      itemsLength = $('.top-menu', topMenu).width();
      for (var i = items.length - 1; 0 <= i; i--) {
        item = $(items[i]);
        itemsLength -= $(items[i]).width();
        if ($(items[i]).offset().left + $(items[i]).width() < $('.top-menu', topMenu).width() &&
          itemsLength > $(items[i]).width()) {
          item.closest('.navbar-nav').animate({'margin-left':
          parseFloat(item.closest('.navbar-nav').css('margin-left')) + $(items[i]).width()}, "slow");
          itemsLength = 0;
          break;
        } else return;
      }
    }
  });
  btnRight.on('click swiperight', function () {
    debugger;
    if ($(window).width() < $('.top-menu', topMenu).width())
      for (var i = 0; items.length > i; i++) {
        item = $(items[i]);
        itemsLength += $(items[i]).offset().left;
        if ($(items[i]).offset().left < topMenu.width() &&
          itemsLength > topMenu.width()) {
          item.closest('.navbar-nav').animate({'margin-left':
            (parseFloat(item.closest('.navbar-nav').css('margin-left')) - $(items[i]).width())}, "slow");
          itemsLength = 0;
          break;
        }
      }
  });

};
$(document).ready(function () {
  initTopNavBar();
});