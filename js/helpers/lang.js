/*!
 * Iguana helpers/lang
 *
 */

helperProto.prototype.lang = function(langID) {
  var langIDComponents = langID.split('.');

  if (lang && langIDComponents && lang[settings.defaultLang][langIDComponents[0]][langIDComponents[1]])
    return lang[settings.defaultLang][langIDComponents[0]][langIDComponents[1]];
  else
    if (dev.showConsoleMessages && dev.isDev) console.log('Missing translation in js/' +  settings.defaultLang.toLowerCase() + '.js ' + langID);
    return '{{ ' + langID + ' }}';
}