/*!
 * Iguana helpers/modal
 *
 */

// TODO: This is a temporal solution until the Bootstrap modal is integrated.
helperProto.prototype.toggleModalWindow = function(formClassName, timeout) {
  var modalWindow = $('.' + formClassName),
      viewportWidth = $(window).width(),
      formContainer = modalWindow.closest('.form-container'),
      mainContainer = $('.main');

  if (modalWindow.hasClass('fade')) {
    modalWindow.removeClass('hidden');
    mainContainer.addClass('blur');
    formContainer.addClass('blur');
    modalWindow.removeClass('blur');

    setTimeout(function() {
      modalWindow.removeClass('fade');
      $('body').addClass('modal-open');
    }, 10);
  } else {
    modalWindow.addClass('fade');
    formContainer.removeClass('blur');

    setTimeout(function() {
      modalWindow.addClass('hidden');
      modalWindow.addClass('fade');
      formContainer.removeClass('blur');
      if (formContainer.length === formContainer.not(":visible").length) mainContainer.removeClass('blur');
      $('body').removeClass('modal-open');
    }, timeout);
  }
}