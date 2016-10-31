/*!
 * Iguana message modal template
 *
 */

'use_strict';
//You can close the modal with 'data-dismiss="modal"' params
templates.registerTemplate('messageModal',
'<div class="modal fade" id="messageModal" role="dialog">' +
  '<div class="modal-dialog">' +
    '<div class="modal-content msg-content unselectable cursor-pointer">' +
      '<div class="modal-header msgbox-header">' +
        '<div class="msg-body" data-dismiss="modal"></div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>');