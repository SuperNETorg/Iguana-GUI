/*!
 * Iguana helpers/format
 *
 */

// format a number
helperProto.prototype.decimalPlacesFormat = function(value) {
  var valueComponents = value.toString().split('.');

  if (value < 1 && value > 0) {

    for (var i=0; i < valueComponents[1].length; i++) {
      if (Number(valueComponents[1][i]) !== 0) {
        decimalPlacesCoin = i + 2;
        decimalPlacesCurrency = decimalPlacesCoin;
        break;
      }
    }
  } else {
    decimalPlacesCoin = settings.decimalPlacesCoin;
    decimalPlacesCurrency = settings.decimalPlacesCurrency;
  }

  if (!valueComponents[1]) { // show only the whole number if right part eq zero
    decimalPlacesCoin = decimalPlacesCurrency = 0;
  }

  return { 'coin': decimalPlacesCoin, 'currency': decimalPlacesCurrency };
}

helperProto.prototype.getCursorPositionInputElement = function(element) {
  if (element.selectionStart) return element.selectionStart;

  else if (document.selection) {
    element.focus();
    var r = document.selection.createRange();
    if (r == null) return 0;

    var re = element.createTextRange(),
        rc = re.duplicate();
    re.moveToBookmark(r.getBookmark());
    rc.setEndPoint('EndToStart', re);

    return rc.text.length;
  }

  return 0;
}

helperProto.prototype.reindexAssocArray = function(array) {
  var _array = [],
      index = 0;

  $.each(array, function(key, value) {
    if (value) {
      _array[index] = value;
      index++;
    }
  });

  return _array;
}

helperProto.prototype.trimComma = function(str) {
  if (str[str.length - 1] === ' ') {
    str = str.replace(/, $/, '');
  }

  return str;
}