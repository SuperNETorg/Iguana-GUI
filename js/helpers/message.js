/*!
 * Iguana helpers/message
 *
 */

helperProto.prototype.initMessageModal = function() {
  var body = $('body'),
      messageModal = '#messageModal';

  body.append(templates.all.messageModal);
}

helperProto.prototype.prepMessageModal = function(message, color, fireModal) {
  var messageModal = $('#messageModal');

  messageModal.removeClass('msg-red').removeClass('msg-blue').removeClass('msg-green');
  messageModal.addClass('msg-' + color);
  $('#messageModal .msg-body').html(message);

  if (fireModal) {
    messageModal.modal('show');
  }
}

helperProto.prototype.prepNoDaemonModal = function() {
  $('#messageModal').off();
  helperProto.prototype.prepMessageModal(helperProto.prototype.lang('MESSAGE.NO_REQUIRED_DAEMON_P1') +
    ' <a onclick="helperProto.prototype.prepRequirementsModal()" class="cursor-pointer">' + helperProto.prototype.lang('MESSAGE.NO_REQUIRED_DAEMON_P2') + '</a> ' + helperProto.prototype.lang('MESSAGE.NO_REQUIRED_DAEMON_P3') +
    (helperProto.prototype.getCurrentPage() !== 'login' &&
    helperProto.prototype.getCurrentPage() !== 'create-account' ? '<br/><br/><a onclick=\"helperProto.prototype.logout()\">' + helperProto.prototype.lang('DASHBOARD.LOGOUT') + '</a>' : ''), 'red', true);
}

helperProto.prototype.prepRequirementsModal = function() {
  helperProto.prototype.prepMessageModal(helperProto.prototype.lang('MESSAGE.MINIMUM_DAEMON_CONF'), 'blue', true);

  // "No required daemon is running" message always stays active on top of any ui
  //  this ensures that users won't interact with any elements until connectivity problems are resolved
}