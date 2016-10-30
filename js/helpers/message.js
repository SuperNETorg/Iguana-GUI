/*!
 * Iguana helpers/message
 *
 */

helperProto.prototype.initMessageModal = function() {
  var body = $('body'),
      messageModal = $('#messageModal');

  body.append(templates.all.messageModal);

  messageModal.off();
  messageModal.click(function() {
    messageModal.removeClass('in');
    setTimeout(function() {
      messageModal.hide();
    }, 250);

    // message modal on close blur fix
    // ugly
    if ($('.modal:visible').length) {
      setTimeout(function() {
        body.addClass('modal-open');
      }, 400);
    } else {
      body.removeClass('modal-open');
    }
  });
}

helperProto.prototype.prepMessageModal = function(message, color, fireModal) {
  var messageModal = $('#messageModal');

  messageModal.removeClass('msg-red').removeClass('msg-blue').removeClass('msg-green');
  messageModal.addClass('msg-' + color);
  $('#messageModal .msg-body').html(message);

  if (fireModal) {
    messageModal.show();
    setTimeout(function() {
      messageModal.addClass('in');
    }, 100);
  }
}

helperProto.prototype.prepNoDaemonModal = function() {
  $('#messageModal').off();
  helperProto.prototype.prepMessageModal(helperProto.prototype.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') +
    ' <a onclick="helperProto.prototype.prepRequirementsModal()" class="cursor-pointer">' + helperProto.prototype.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') + '</a>' +
    (helperProto.prototype.getCurrentPage() !== 'login' &&
    helperProto.prototype.getCurrentPage() !== 'create-account' ? '<br/><br/><a onclick=\"helperProto.prototype.logout()\">' + helperProto.prototype.lang('DASHBOARD.LOGOUT') + '</a>' : ''), 'red', true);
}

helperProto.prototype.prepRequirementsModal = function() {
  helperProto.prototype.prepMessageModal(helperProto.prototype.lang('MESSAGE.MINIMUM_DAEMON_CONF'), 'blue', true);

  // "No required daemon is running" message always stays active on top of any ui
  //  this ensures that users won't interact with any elements until connectivity problems are resolved
}