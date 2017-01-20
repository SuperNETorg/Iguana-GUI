angular.module('IguanaGUIApp')
.service('http', [
  '$q',
  '$http',
  'vars',
  function ($q, $http, vars) {

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
      loaders();
      deferred.resolve(response)
    }

    function onReject(deferred, response) {
      loaders();
      deferred.reject(response)
    }

    function loaders() {
      vars['loading'] = false;
    }
  }
]);

