angular.module('IguanaGUIApp')
.filter('objectFilter', function() {
  return function(input, search) {
    if (!input)
      return input;
    if (!search)
      return input;

    var expected = ('' + search).toLowerCase(),
        result = {};

    angular.forEach(input, function(value, key) {
      var actual = (value.name).toLowerCase();

      if (actual.indexOf(expected) !== -1) {
        result[key] = value;
      }
    });

    return result;
  }
});