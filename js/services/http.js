angular.module('IguanaGUIApp')
.service('http', [
  '$q',
  '$http',
  'vars',
  'error',
  function ($q, $http, vars, error) {

    return {
      get: get,
      post: post
    };

    function get(...arguments) {
      vars['loading'] = true;
      var deferred = $q.defer();
      $http
        .get.apply(null, arguments)
        .then(onResolve.bind(this, deferred), onReject.bind(this, deferred));

      return deferred.promise;
    }

    function post(...arguments) {
      vars['loading'] = true;
      var deferred = $q.defer();
      $http
        .post.apply(null, arguments)
        .then(onResolve.bind(this, deferred), onReject.bind(this, deferred));

      return deferred.promise;
    }

    function onResolve(deferred, response) {
      vars['loading'] = false;
      error.check(response);
      deferred.resolve(response)
    }

    function onReject(deferred, response) {
      vars['loading'] = false;
      error.check(response);
      deferred.reject(response)
    }
  }
]);

