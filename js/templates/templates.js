/*!
 * Iguana templates main
 *
 */

'use_strict';

var templates = (function() {
  var _templates = {};

  _templates.repeaters = {};

  var _registerTemplate = function(templateName, templateBody) {
    _templates[templateName] = templateBody;
  }

  var _registerRepeaterTemplate = function(templateName, templateBody) {
    _templates.repeaters[templateName] = templateBody;
  }

  return {
    registerTemplate: _registerTemplate,
    registerRepeaterTemplate: _registerRepeaterTemplate,
    all: _templates
  }
})();