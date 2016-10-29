/*!
 * Iguana helpers/clipboard
 *
 */

helperProto.prototype.addCopyToClipboardFromElement = function(elementId, elementDisplayName) {
  var hiddenElementId = 'hidden';

  $(elementId).off();
  $(elementId).click(function() {
    if (!isExecCopyFailed)
      try {
        $(elementId + '-' + hiddenElementId).select();
        document.execCommand('copy');
        helperProto.prototype.prepMessageModal(elementDisplayName + ' ' + helperProto.prototype.lang('MESSAGE.COPIED_TO_CLIPBOARD') + ' ' + $(elementId + '-' + hiddenElementId).val(), 'blue', true);
        pasteTextFromClipboard = $(elementId + '-' + hiddenElementId).val();
      } catch(e) {
        isExecCopyFailed = true;
        helperProto.prototype.prepMessageModal(helperProto.prototype.lang('MESSAGE.COPY_PASTE_IS_NOT_SUPPORTED'), 'red', true);
      }
  });
}