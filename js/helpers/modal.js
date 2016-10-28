/*!
 * Iguana helpers/modal
 *
 */

// TODO: This is a temporal solution until the Bootstrap modal is integrated.
helperProto.prototype.toggleModalWindow = function(formClassName, timeout) {
  var modalWindow = $('.' + formClassName),
      viewportWidth = $(window).width();

  if (modalWindow.hasClass('fade')) {
    modalWindow.removeClass('hidden');
    $('.main').addClass('blur');
    $('.form-container').addClass('blur');
    modalWindow.removeClass('blur');

    setTimeout(function() {
      modalWindow.removeClass('fade');
    }, 10);
  } else {
    modalWindow.addClass('fade');
    $('.form-container').removeClass('blur');

    setTimeout(function() {
      modalWindow.addClass('hidden');
      modalWindow.addClass('fade');
      $('.form-container').removeClass('blur');
      if ($('.form-container').length === $('.form-container').not(":visible").length) $('.main').removeClass('blur');
    }, timeout);
  }
}